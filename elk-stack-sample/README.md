# ABOUT THIS LEARNING PROJECT

This project is intended to be used as a "from zero to hero" approach for the ELK stack.

The main idea is to configure Elasticsearch, Logstash with Filebeat and Kibana to show log data published by a running service.

## TASKS TO BE DONE

* Filebeat up & running :white_check_mark:
* Pusblish some logs directly from Filebeat to ElasticSearch :white_check_mark:
* Use Kibana to see the generated logs :x:
* Review the ES indexes creted in the process :x:
* Add Logstash in the middle for log processing :x:
* Put a real application publishing logs and see the e2e process :x:

## IN A NEAR FUTURE
* Secure communication between Filebeat and Elastic using certs :x: 
> seems a very complex topic because you have to generate the certs manually using an elastic tool. Because at this moment we are using basic auth with https maybe we can skip this.