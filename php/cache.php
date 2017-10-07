<?php
/*
    PHP redirect to Petascope service and cache the result only in PNG
    Author: Bang Pham Huu - mailto: b.phamhuu@jacobs-university.de
    Disable selinux to redirect to other IP address if not localhost.   
    
    Dependency on Centos: sudo yum install php-pecl-memcache memcached  
    Restart services: sudo systemctl restart memcached
                      sudo systemctl restart httpd
    Verify memcache is working: php -m | grep memcache
    
    Create log file: sudo touch cached.log in /var/www/html/php
    Change permission to 777: sudo chmod 777 /var/www/html/cached.log
    
    Increase memcache file size to 10 MB
    sudo gedit /usr/lib/systemd/system/memcached.service
    change to 
    ExecStart=/usr/bin/memcached -u $USER -p $PORT -m $CACHESIZE -I $MAXITEMSIZE -c $MAXCONN $OPTIONS 
    and add MAXITEMSIZE="10m" into /etc/sysconfig/memcached 
    then change the maximum cache size to 10 GB
    CACHESIZE="10000"
    and restart memcached
    Verify memcached is working with new maximum size
    ps aux | grep memcached (/usr/bin/memcached -u memcached -p 11211 -m 100 -I 10 ...)
    
    Memcache status
    memcached-tool 127.0.0.1:11211 stats    
*/      
    // Configuration
    // Using POST to both Petascope and Python server
    define("LOG_FILE", "/var/www/html/cache.log");
    // Deploy to server first
    define("DOMAIN_MOON", "http://localhost");
    define("DOMAIN_MARS", "http://localhost");
    define("PETASCOPE_PORT", "8080");
    define("PYTHON_STRETCHING_PORT", "8090");        
    define("PETASCOPE_URL", "DOMAIN" . ":" . PETASCOPE_PORT . "/rasdaman/ows");
    define("PYTHON_STRETCHING_URL", "DOMAIN" . ":" . PYTHON_STRETCHING_PORT . "/python");
    
    $mem = new Memcache();
    // Memcache is localhost server
    $mem->addServer("127.0.0.1", 11211);
    
    header("Access-Control-Allow-Origin: *");
    
    $server = $_GET["server"]; 
    $query = $_GET["wcps_query"];            
    $histogram = $_GET["histogram"];
    $newMinMaxBands = $_GET["newMinMaxBands"];
    

    # get coverage id from the WCPS query, for data in (...)
    preg_match('#\((.*?)\)#', $query, $match);
    $coverage_id = trim($match[1]);
    
    # set file name with coverage_id
    header('Content-Disposition: attachment; filename="' . $coverage_id . '.png' . '"');    
    
    # replace spaces in ( coverage_id )
    $query = preg_replace_callback("~\(([^\)]*)\)~", function($s) {
        return str_replace(" ", "", "($s[1])");
    }, $query);
    
    # encode query as curl cannot handle spaces in URL
    $query = str_replace(' ', '%20', $query);       

    # need to encode "+" to "%2B"
    $query = str_replace('+', '%2B', $query);
          
    # make query with url for Petascope from domain (mars/moon)
    $PETASCOPE_DOMAIN_URL = "";
    $PYTHON_STRETCHING_DOMAIN_URL = "";
    
    if ($server == "mars") {
        $PETASCOPE_DOMAIN_URL = str_replace("DOMAIN", DOMAIN_MARS, PETASCOPE_URL); 
        $PYTHON_STRETCHING_DOMAIN_URL = str_replace("DOMAIN", DOMAIN_MARS, PYTHON_STRETCHING_URL);
    } else {
        $PETASCOPE_DOMAIN_URL = str_replace("DOMAIN", DOMAIN_MOON, PETASCOPE_URL);
        $PYTHON_STRETCHING_DOMAIN_URL = str_replace("DOMAIN", DOMAIN_MOON, PYTHON_STRETCHING_URL); 
    }
    #$redirect_url =  $PETASCOPE_DOMAIN_URL . $encode_query;
    $petascope_url = $PETASCOPE_DOMAIN_URL;
    $redirect_url = $petascope_url;

    $post = "query=" . $query;
   
    if (strpos($query, "tiff") == true) {
        // tiff -> Pyton stretching service which get result from Petascope and process with Python,
        // then returns in PNG as normally
        $redirect_url = $PYTHON_STRETCHING_DOMAIN_URL;
        // post this wcpsQuery=http://....?query=... to Python server
        $post = "wcpsQuery=" . $petascope_url . "?" . $post;               
    }       

    // If request with histogram or newMinMaxBands so it is fetched from cached stretching tiff coverage in python
    if (!empty($histogram)) {
      $post = $post . "&histogram";
    } else if (!empty($newMinMaxBands)) {
      $post = $post . "&" . $newMinMaxBands;
    }

    // echo $post;          	
    // hash the key to unique value and store in memcache
    $key = md5($post);
    $result = $mem->get($key);    
 
     if ($result) {
        echo $result;
        write_to_log('Key: ' . $key . ' is retrieving data from memcached.');
    } else {
        $response = post_web_page($redirect_url, $post);
        echo $response;
        write_to_log('Key: ' . $key . ' is storing data to memcached.');
        $mem->set($key, $response) or die("Couldn't save anything to memcached...");
    }
    
    #echo $response;

function write_to_log($content) {
    date_default_timezone_set('UTC');
    file_put_contents(LOG_FILE, date("c") . " " . $content . "\r\n", FILE_APPEND);
}

function post_web_page($url, $post) { 
  
   $ch = curl_init($url);

    $options = array(
        CURLOPT_RETURNTRANSFER => true,   // return web page
        CURLOPT_HEADER         => false,  // don't return headers (use to get ERROR when set to true)
        CURLOPT_FOLLOWLOCATION => true,   // follow redirects
        CURLOPT_MAXREDIRS      => 10,     // stop after 10 redirects
        CURLOPT_ENCODING       => "",     // handle compressed
        CURLOPT_USERAGENT      => "test", // name of client
        CURLOPT_AUTOREFERER    => true,   // set referrer on redirect
        CURLOPT_CONNECTTIMEOUT => 20,    // time-out on connect
        CURLOPT_TIMEOUT        => 20,    // time-out on response
        CURLOPT_FAILONERROR    => true,  // returns error from curl
    ); 

   curl_setopt_array($ch, $options);

   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

   // execute!
   $response = curl_exec($ch);

    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
   // close the connection, release resources used
   curl_close($ch); 
    
    if ($http_status == 200) {
        return $response;
    }    

    # error in curl, don't do anything to return value to client
    write_to_log("Error from server: " . $http_status . " " . $curl_error);
    exit (1);
}

function get_web_page($url) {
    //echo $url;
    $url = 'http://moon.planetserver.eu:8080/rasdaman/ows?query=for%20data%20in%20(M3G20090117T011605)%20return%20encode({red:(float)(((int)(255/(max((data).band_10)%20-%20min((data).band_10)))%20*%20((data).band_10%20-%20min((data).band_10))));%20green:%20(float)(((int)(255/(max((data).band_13)%20-%20min((data).band_13)))%20*%20((data).band_13%20-%20min((data).band_13))));%20blue:%20(float)(((int)(255/(max((data).band_78)%20-%20min((data).band_78)))%20*%20((data).band_78%20-%20min((data).band_78))));%20alpha:%20(float)((((data).band_85%20>0)%20*%20255))},%20"png",%20"nodata=65535")';
    $options = array(
        CURLOPT_RETURNTRANSFER => true,   // return web page
        CURLOPT_HEADER         => false,  // don't return headers (use to get ERROR when set to true)
        CURLOPT_FOLLOWLOCATION => true,   // follow redirects
        CURLOPT_MAXREDIRS      => 10,     // stop after 10 redirects
        CURLOPT_ENCODING       => "",     // handle compressed
        CURLOPT_USERAGENT      => "test", // name of client
        CURLOPT_AUTOREFERER    => true,   // set referrer on redirect
        CURLOPT_CONNECTTIMEOUT => 20,    // time-out on connect
        CURLOPT_TIMEOUT        => 20,    // time-out on response
        CURLOPT_FAILONERROR    => true,  // returns error from curl
    ); 

    $ch = curl_init($url);
    curl_setopt_array($ch, $options);

    $content  = curl_exec($ch);       
    // also get the error and response code
    $errors = curl_error($ch);
    var_dump($errors);    
    echo "content: ". $content;
    
    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    if ($http_status == 200) {
        return $content;
    }    

    # error in curl, don't do anything to return value to client
    write_to_log("Error from server: " . $http_status . " " . $curl_error);
    exit (1);
}
 
?>

