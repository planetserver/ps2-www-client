To reduce the size of file .dbf, open this file with LibreOffice Calc and removed the unnecessary columns. Rename the remaining columns without noisy texts (e.g: name,C,254 to name) then save the file as .csv.

Then, convert reduced .csv file to .dbf with gdal, example:

ogr2ogr MARS_nomenclature.dbf  MARS_nomenclature1.csv
