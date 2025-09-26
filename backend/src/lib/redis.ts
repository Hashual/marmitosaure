import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redisUri = process.env.REDIS_URI || 'redis://localhost:6379/0';
const redis = new Redis(redisUri);

redis.on('error', (err) => {
	logger.error(`Redis error: ${err.message}`);
});

redis.on('connect', () => {
	logger.info('Connected to Redis');
});

redis.on('reconnecting', () => {
	logger.warn('Reconnecting to Redis...');
});

redis.on('end', () => {
	logger.warn('Disconnected from Redis');
});

export default redis;