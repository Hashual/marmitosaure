import { logger } from "../utils/logger";

// @ts-ignore
import models from 'express-cassandra';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

models.setDirectory( __dirname + '/../cassandra/models').bind(
    {
        clientOptions: {
            contactPoints: ['127.0.0.1'],
            localDataCenter: 'datacenter1',
            keyspace: 'mykeyspace',
            queryOptions: {consistency: models.consistencies.one}
        },
        ormOptions: {
            defaultReplicationStrategy : {
                class: 'SimpleStrategy',
                replication_factor: 1
            },
            dropTableOnSchemaChange: false
        }
    },
    function(err: Error) {
        if(err) logger.error(`Cassandra error: ${err.message}`);
        else logger.info(`Cassandra timeuuid: ${models.timeuuid()}`);
    }
);

export async function SetupCassandra() { }