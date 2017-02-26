<?php
/*
    PHP redirect to Petascope service and cache the result only in PNG
    Author: Bang Pham Huu - mailto: b.phamhuu@jacobs-university.de
    Disable selinux to redirect to other IP address if not localhost.   
    
    Dependency on Centos: sudo yum install php-pecl-memcache  
    Restart services: sudo systemctl restart memcached
                      sudo systemctl restart httpd
    Verify memcache is working: php -m | grep memcache
    
    Create log file: sudo touch cached.log in /var/www/html
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
    define("LOG_FILE", "/var/www/html/cache.log");
    define("DOMAIN_MOON", "http://moon.planetserver.eu");
    define("DOMAIN_MARS", "http://mars.planetserver.eu");
    define("PETASCOPE_PORT", "8080");
    define("PYTHON_STRETCHING_PORT", "8090");        
    define("PETASCOPE_URL", "DOMAIN" . ":" . PETASCOPE_PORT . "/rasdaman/ows?service=WCS&version=2.0.1&request=ProcessCoverages&query=");
    define("PYTHON_STRETCHING_URL", "DOMAIN" . ":" . PYTHON_STRETCHING_PORT . "/python?wcpsQuery=");
    
    $mem = new Memcache();
    // Memcache is localhost server
    $mem->addServer("127.0.0.1", 11211);
    
    header("Access-Control-Allow-Origin: *");
    
    $server = $_GET["server"]; 
    $query = $_GET["wcps_query"];            

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
    $encode_query = str_replace (' ', '%20', $query); 
      
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
    $redirect_url =  $PETASCOPE_DOMAIN_URL . $encode_query;
    
    if (strpos($query, "tiff") == true) {
        // tiff -> Pyton stretching service which get result from Petascope and process with Python,
        // then returns in PNG as normally
        $redirect_url = $PYTHON_STRETCHING_DOMAIN_URL . $redirect_url;       
    }
        
    // hash the key to unique value and store in memcache
    $key = md5($encode_query);
    $result = $mem->get($key);    
    
     if ($result) {
        echo $result;
        write_to_log('Key: ' . $key . ' is retrieving data from memcached.');
    } else {
        $response = get_web_page($redirect_url);
        echo $response;
        write_to_log('Key: ' . $key . ' is storing data to memcached.');
        $mem->set($key, $response) or die("Couldn't save anything to memcached...");
    }
    
    #echo $response;

function write_to_log($content) {
    date_default_timezone_set('UTC');
    file_put_contents(LOG_FILE, date("c") . " " . $content . "\r\n", FILE_APPEND);
}

function get_web_page($url) {
    $options = array(
        CURLOPT_RETURNTRANSFER => true,   // return web page
        CURLOPT_HEADER         => false,  // don't return headers (use to get ERROR when set to true)
        CURLOPT_FOLLOWLOCATION => true,   // follow redirects
        CURLOPT_MAXREDIRS      => 10,     // stop after 10 redirects
        CURLOPT_ENCODING       => "",     // handle compressed
        CURLOPT_USERAGENT      => "test", // name of client
        CURLOPT_AUTOREFERER    => true,   // set referrer on redirect
        CURLOPT_CONNECTTIMEOUT => 50,    // time-out on connect
        CURLOPT_TIMEOUT        => 50,    // time-out on response
        CURLOPT_FAILONERROR    => true,  // returns error from curl
    ); 

    $ch = curl_init($url);
    curl_setopt_array($ch, $options);

    $content  = curl_exec($ch);       
    // also get the error and response code
    #$errors = curl_error($ch);
    #var_dump($errors);    
    #echo "content: ". $content;
    
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
