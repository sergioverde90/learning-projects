package org.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class App {

    private static final Logger logger = LoggerFactory.getLogger(App.class);
    
    public static void main( String[] args ) throws InterruptedException {
        logger.debug("Hello World!");

        // add time to process the TCP request 
        // if the process ends the request never gets out
        Thread.sleep(1000);
    }
}
