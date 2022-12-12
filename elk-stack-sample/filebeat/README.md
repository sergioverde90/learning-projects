# FILEBEAT

## THE MOST BASIC CONFIGURATION

The most basic configuration to test filebeat could be something like this:

```yaml
filebeat.inputs:
- type: stdin # manual input from the terminal

output.console: # also the output is the terminal 
  pretty: true
```

And, running filebeat from scratch using the [docker image](https://www.elastic.co/guide/en/beats/filebeat/current/running-on-docker.html) published by elastic:

```bash
docker run -it --rm --name=filebeat --user=root --volume="$(pwd)/filebeat.docker.yml:/usr/share/filebeat/filebeat.yml:ro" docker.elastic.co/beats/filebeat:8.5.3 filebeat
```

Notice the container is running as `-it`. Now you can write to the stdin and, automatically, will be pushed to the stdout. Not very useful for a real project, but it's enough for training purposes :smile:

> :bulb: What's the difference between Logstash and Filebeat? See https://logz.io/blog/filebeat-vs-logstash/