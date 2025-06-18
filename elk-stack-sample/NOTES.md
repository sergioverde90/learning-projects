# UP & RUNNING BUT...

* First time you run elastic there will be no index created. If you use the filebeat-interactive tool, an index will be created automatically, but still you have to create a dataview in the 'Discovery' section to visualize the streaming data from filebeat.

* Elastichsearch is configured to be running with security enabled (see the environment configuration in the docker-compose.yml file regarding the xpack.security properties). If you try to cURL elastic directly you will recive an empty server response. If you disable security the cURL will start working BUT DO NOT DO THIS. Instead, use https://localhost:9200 with the -k (or --insecure) option, and use the -u user:password flag to use basic authentication in the request. That should allow the cURL to reach elastic and return a response.

# TIPS & TRICKS

* Lets suppose that you loose communication between your main traces source and logstash for some reason. Usually, we have to check two things: that the source that send traces is actually doing it and that logstash is ready to ingest data as well. For the former, we can create a tcpdump listening the port that is supposed to receive the data.

```bash
sudo tcpdump -i any -n tcp dst port 4560
```

For the later, we can send some input directly over the socker waiting to ingest data:

```bash
nc localhost 4560 <  tmp.json
```

* Suppose you assume you have a running service in a given port that is working fine (let say s1), but when a second service (s2) tries to connect to s1 it fails saying connection refussed or something similar. To try out your assumption and verify that the s1 service is running in the expected port you can use `netcat`:

```bash
nc -zv <hostname_or_ip_address> <port_number>

-z: Specifies that nc should just scan for listening daemons, without sending any data to them.
-v: Provides verbose output, showing more details about the connection attempt.
```