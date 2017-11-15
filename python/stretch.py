#!/usr/bin/python
import urllib
import urllib2
import sys
import os
import collections
from PIL import Image
from StringIO import StringIO
from osgeo.gdalconst import *
from osgeo import gdal
from uuid import uuid4

# Memcached in python cannot store image so using redis server and python client
# To Start redis server as daemon service: redis-server --daemonize yes
import redis
import hashlib
import math

# check the wcpsQuery result tif is already cached
redis_cached = redis.Redis(host='localhost', port=6379)

# Author: Bang Pham Huu, mailto: b.phamhuu@jacobs-university.de
def histogram(fileName):
    from PIL import Image
    img = Image.open(fileName)
    histBand1 = img.split()[0].histogram()
    histBand2 = img.split()[1].histogram()
    histBand3 = img.split()[2].histogram()

    return str(histBand1) + "_" + str(histBand2) + "_" + str(histBand3)

class StretchHandler:
    def __init__(self, image, wcpsQuery):
        self.image = image;
        self.wcpsQuery = wcpsQuery;
        self.bandStats = collections.OrderedDict()
        self.bandStretchValues = collections.OrderedDict()
        self.totalBand = 0;
        self.dataSet = None;
        self.outputDirectory = os.path.dirname(os.path.realpath(__file__)) + "/tmp/";
        self.outputPNGFileName = "";

        # array values after been stretched
        self.stretchArray = collections.OrderedDict();        

        # return the PNG as byte arrays to stream
        self.output = None;
        # a WCPS query without newMinMaxBands as parameter need to store the histogram of PNG output
        self.createHistogram = False;

    # Write the stretched image to file
    def createOutputFile(self, totalBand, prefix):
        rows = self.dataSet.RasterXSize
        cols = self.dataSet.RasterYSize

        # it will create a temporary tiff file then png file
        tmpFileTiff = self.outputDirectory +  prefix + "_" + uuid4().get_hex() + ".tiff"
        self.outputPNGFileName = self.outputDirectory + prefix + "_" + uuid4().get_hex() + ".png"

        tiff_driver = gdal.GetDriverByName('GTiff')
        tiff_outRaster = tiff_driver.Create(tmpFileTiff, rows, cols, totalBand, gdal.GDT_Byte)

        bandNumber = 1;
        for i in range ( self.totalBand ):
            tiff_outband = tiff_outRaster.GetRasterBand(bandNumber)
            tiff_outband.WriteArray( self.stretchArray[ "b" + str(bandNumber) ] )
            tiff_outband.SetNoDataValue(0)
            tiff_outband.FlushCache()
            bandNumber += 1

        # Remove tiff file
        os.remove(tmpFileTiff)

        png_driver = gdal.GetDriverByName("PNG")
        png_driver.CreateCopy( self.outputPNGFileName, tiff_outRaster, 0 )
        os.remove( self.outputPNGFileName  + ".aux.xml");

        # Read the output PNG and return to client
        image = open(self.outputPNGFileName, "rb")
        self.output = image.read()
        image.close()

        if self.createHistogram:
            hist = histogram(self.outputPNGFileName)
            bandNumber = 1;

            hist_result = "";
            for band in range( self.totalBand ):
                if bandNumber != 4:
                    bandMin = str(self.bandStretchValues["b" + str(bandNumber)][0]) if self.bandStretchValues["b" + str(bandNumber)][0] >= 0 else str(0)
                    bandMax = str(self.bandStretchValues["b" + str(bandNumber)][1]) if self.bandStretchValues["b" + str(bandNumber)][1] <= 255 else str(255)
                    hist_result = hist_result + bandMin + ":" + bandMax + "_"

                bandNumber += 1;

            # append the histogram for all 3 bands
            hist_result = hist_result + hist 

            histogram_key = hashlib.sha256("histogram_" + self.wcpsQuery).hexdigest()            
            # cache histogram of the original PNG (without newMinMaxBands)
            redis_cached.set(histogram_key, hist_result)            

        # Remove the PNG file after reading the content
        os.remove(self.outputPNGFileName)            

    # Stretch image's bands with new range
    def stretchImage(self):

        print "Total band: ", self.totalBand
        bandNumber = 1;
        for band in range( self.totalBand ):
            band = self.dataSet.GetRasterBand(bandNumber);
            array = band.ReadAsArray()

            if bandNumber != 4:
                # Stretch with new range for each band
                newMin = self.bandStretchValues["b" + str(bandNumber)][0]
                newMax = self.bandStretchValues["b" + str(bandNumber)][1]
                percent = 255 / (newMax - newMin)
                array = (array - newMin) * percent

            # Add all stretched array and write to a new file
            self.stretchArray["b" + str(bandNumber)] = array
            bandNumber += 1;

        # also write to file
        self.createOutputFile(self.totalBand, "rgb")

    # Stretch PNG image with the statistic values for each band by standard deviation
    def calculateStretchByStaDev(self):

        # From b1 - b3
        if self.bandStats["b1"] is not None:
            mean = self.bandStats["b1"][0]
            staDev = self.bandStats["b1"][1]
            newMax = int(mean + 1.5 * staDev)
            newMin = int(mean - 1.5 * staDev)
            print 'band 1='
            print newMin
            print newMax
            self.bandStretchValues["b1"] = [newMin, newMax]

        if self.bandStats["b2"] is not None:
            mean = self.bandStats["b2"][0]
            staDev = self.bandStats["b2"][1]
            newMax = int(mean + 1.5 * staDev)
            newMin = int(mean - 1.5 * staDev)
            print 'band 2='
            print newMin
            print newMax
            self.bandStretchValues["b2"] = [newMin, newMax]

        if self.bandStats["b3"] is not None:
            mean = self.bandStats["b3"][0]
            staDev = self.bandStats["b3"][1]
            newMax = int(mean + 1.5 * staDev)
            newMin = int(mean - 1.5 * staDev)
            print 'band 3='
            print newMin
            print newMax
            self.bandStretchValues["b3"] = [newMin, newMax]

        print self.bandStretchValues
        self.stretchImage()

    # Get WCPS query (localhost:8090/python/stretch?wcpsQuery=WCPS_QUERY

    def parseURI(self, URI):        
        tmp = URI.split("?query=")
        petascopeEndPoint = tmp[0]
        # wcps query &red=20:30_blue=20:50_green=50:70 for input new min, new max for each bands
        newMinMaxBands = None                
        if "&" not in tmp[1]:
            wcpsQuery = tmp[1]
            # WCPS query to create tif must store the histogram
            self.createHistogram = True
        else:
            wcpsQuery = tmp[1].split("&")[0]            
            if "histogram" in tmp[1]:
                # Histogram never sent with the newMinMax bands (it only needs the WCPS query in tiff to calculate then stored to the redis)
                # it must exist in redis
                histogram_key = hashlib.sha256("histogram_" + wcpsQuery).hexdigest() 
                hist_result = redis_cached.get(histogram_key)                      
                print "Get from redis: " + hist_result
                return hist_result
            else:                
                newMinMaxBands = tmp[1].split("&")[1]

        self.wcpsQuery = wcpsQuery
        tiff_key = hashlib.sha256("tiff_" + wcpsQuery).hexdigest()
        
        # handle with GDAL, get some information (it must use "/vsimem/" or it cannot read file)
        mmap_name = "/vsimem/" + uuid4().get_hex()

  
        cached = redis_cached.get(tiff_key)
            
        if cached is None:                
            # always send by POST to petascope end point, don't quote the query, encode is enough
            data = urllib.urlencode({'query' : wcpsQuery})
            request = urllib2.Request(petascopeEndPoint, data, headers={"Accept-Encoding": "gzip"})
            response = urllib2.urlopen(request, timeout=30)

            # read file from urllib
            tifImage = response.read()            
            # cache the image
            redis_cached.set(tiff_key, tifImage)                    
            gdal.FileFromMemBuffer(mmap_name, tifImage)        

        else:
            # read file from redis
            gdal.FileFromMemBuffer(mmap_name, cached)       
        
        self.dataSet = gdal.Open(mmap_name)

        '''test = "/home/rasdaman/ows (1).png"
        self.dataSet = gdal.Open(test)'''

        self.totalBand = self.dataSet.RasterCount;
        print "Raster band count: ", self.totalBand;

        if newMinMaxBands is None:
            # calculate the min, max for each band
            bandNumber = 1

            # Store the mean and standard deviation for each band
            for band in range( self.totalBand ):
                print "Getting band: ", bandNumber

                # Get the statistic from band
                band = self.dataSet.GetRasterBand(bandNumber)
                if band is None:
                        continue
                stats = band.GetStatistics( True, True )

                print "[ STATS ] =  Minimum=%.3f, Maximum=%.3f, Mean=%.3f, StdDev=%.3f" % ( stats[0], stats[1], stats[2], stats[3] )

                # Add the band and values to bandStats
                self.bandStats["b" + str(bandNumber)] = [ stats[2], stats[3] ]

                bandNumber += 1
            # Calculate the stretch values for each band by standard deviation
            self.calculateStretchByStaDev();
        else:
            # already have new min, new max, just do the stretch
            tmp = newMinMaxBands.split("_")
            newMinBand1 = tmp[0].split(":")[0]
            newMaxBand1 = tmp[0].split(":")[1]

            newMinBand2 = tmp[1].split(":")[0]
            newMaxBand2 = tmp[1].split(":")[1]

            newMinBand3 = tmp[2].split(":")[0]
            newMaxBand3 = tmp[2].split(":")[1]

            self.bandStretchValues["b1"] = [int(newMinBand1), int(newMaxBand1)]
            self.bandStretchValues["b2"] = [int(newMinBand2), int(newMaxBand2)]
            self.bandStretchValues["b3"] = [int(newMinBand3), int(newMaxBand3)]

            print self.bandStretchValues

            self.stretchImage()
        
        print "Return output"

        return self.output;
# test
#http://localhost:8090/stretch?wcpsQuery=http://mars.planetserver.eu:8080/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=for%20data%20in%20(%20frt0000b385_07_if164l_trr3%20)%20return%20encode(%20{%20red:%20(int)%20(%20255%20/%20(%20max((1%20-%20((1%20-%20(0.607142857))*data.band_171*(data.band_171%20!=%2065535)%20+%20(0.607142857)*data.band_213*(data.band_213%20!=%2065535))/(data.band_197*(data.band_197%20!=%2065535))))%20-%20min((1%20-%20((1%20-%20(0.607142857))*data.band_171*(data.band_171%20!=%2065535)%20+%20(0.607142857)*data.band_213*(data.band_213%20!=%2065535))/(data.band_197*(data.band_197%20!=%2065535))))%20))%20*%20(%20((1%20-%20((1%20-%20(0.607142857))*data.band_171*(data.band_171%20!=%2065535)%20+%20(0.607142857)*data.band_213*(data.band_213%20!=%2065535))/(data.band_197*(data.band_197%20!=%2065535))))%20-%20min((1%20-%20((1%20-%20(0.607142857))*data.band_171*(data.band_171%20!=%2065535)%20+%20(0.607142857)*data.band_213*(data.band_213%20!=%2065535))/(data.band_197*(data.band_197%20!=%2065535))))%20);%20green:%20(int)(%20255%20/%20(%20max((1%20-%20((data.band_173*(data.band_173%20!=%2065535))%20/%20((1%20-%20(0.63125))%20*%20data.band_142*(data.band_142%20!=%2065535)%20+%20(0.63125)%20*%20data.band_191*(data.band_191%20!=%2065535)))))%20-%20min((1%20-%20((data.band_173*(data.band_173%20!=%2065535))%20/%20((1%20-%20(0.63125))%20*%20data.band_142*(data.band_142%20!=%2065535)%20+%20(0.63125)%20*%20data.band_191*(data.band_191%20!=%2065535)))))%20))%20*%20(%20((1%20-%20((data.band_173*(data.band_173%20!=%2065535))%20/%20((1%20-%20(0.63125))%20*%20data.band_142*(data.band_142%20!=%2065535)%20+%20(0.63125)%20*%20data.band_191*(data.band_191%20!=%2065535)))))%20-%20min((1%20-%20((data.band_173*(data.band_173%20!=%2065535))%20/%20((1%20-%20(0.63125))%20*%20data.band_142*(data.band_142%20!=%2065535)%20+%20(0.63125)%20*%20data.band_191*(data.band_191%20!=%2065535)))))%20);%20blue:%20(int)(%20255%20/%20(%20max((0.5%20*%20(1%20-%20((data.band_142*(data.band_142%20!=%2065535))%20/%20((1%20-%20(0.36346516))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.36346516)%20*%20data.band_163*(data.band_163%20!=%2065535))))%20*%200.5%20*%20(1%20-%20((data.band_151*(data.band_151%20!=%2065535))%20/%20((1%20-%20(0.636167379))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.636167379)%20*%20data.band_163*(data.band_163%20!=%2065535))))))%20-%20min((0.5%20*%20(1%20-%20((data.band_142*(data.band_142%20!=%2065535))%20/%20((1%20-%20(0.36346516))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.36346516)%20*%20data.band_163*(data.band_163%20!=%2065535))))%20*%200.5%20*%20(1%20-%20((data.band_151*(data.band_151%20!=%2065535))%20/%20((1%20-%20(0.636167379))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.636167379)%20*%20data.band_163*(data.band_163%20!=%2065535))))))%20))%20*%20(%20((0.5%20*%20(1%20-%20((data.band_142*(data.band_142%20!=%2065535))%20/%20((1%20-%20(0.36346516))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.36346516)%20*%20data.band_163*(data.band_163%20!=%2065535))))%20*%200.5%20*%20(1%20-%20((data.band_151*(data.band_151%20!=%2065535))%20/%20((1%20-%20(0.636167379))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.636167379)%20*%20data.band_163*(data.band_163%20!=%2065535))))))%20-%20min((0.5%20*%20(1%20-%20((data.band_142*(data.band_142%20!=%2065535))%20/%20((1%20-%20(0.36346516))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.36346516)%20*%20data.band_163*(data.band_163%20!=%2065535))))%20*%200.5%20*%20(1%20-%20((data.band_151*(data.band_151%20!=%2065535))%20/%20((1%20-%20(0.636167379))%20*%20data.band_130*(data.band_130%20!=%2065535)%20+%20(0.636167379)%20*%20data.band_163*(data.band_163%20!=%2065535))))))%20);%20alpha:%20(data.band_100%20!=%2065535)%20*%20255%20},%20%22png%22,%20%22nodata=null%22)
#stretchHandle = StretchHandler("", "")
#stretchHandle.stretchBand(1, 135, 173)
#stretchHandle.parseURI("")
