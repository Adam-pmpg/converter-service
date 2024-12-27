# RabbitMQ

## Opis

Dla developowania jest postawiony Rabbit na dockerze

## Setup

http://localhost:15672/

## Komendy

rabbitmqadmin list queues

rabbitmqadmin list queues name messages messages_ready messages_unacknowledged

rabbitmqadmin get queue=convertion_tasks count=10

### Dodanie message

#### Bezpośrednio w dockerze

rabbitmqadmin publish routing_key=conversion_tasks payload="Test message 1"

#### curl'em
```
curl -u guest:guest -H "content-type:application/json" \
-X POST \
-d '{"properties":{},"routing_key":"conversion_tasks","payload":"Test message curl 1","payload_encoding":"string"}' \
http://localhost:15672/api/exchanges/%2F/amq.default/publish
```

## rabbitmqctl

### Sprawdzenie czy konsument działa

```
rabbitmqctl list_queues name consumers
```

