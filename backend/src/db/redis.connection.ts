import { createClient } from 'redis';

// Production-ready Redis client configuration
export const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        reconnectStrategy: () => {
            const delay = Math.min(3 * 50, 3000);
            return delay;
        }
    },
    // Enable offline queue for better handling of connection issues
    disableOfflineQueue: false,
    // Add some performance optimizations
    commandsQueueMaxLength: 100,
});

// Handle Redis events for better monitoring and debugging
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
    console.log('Redis Client Ready');
});

redisClient.on('reconnecting', () => {
    console.log('Redis Client Reconnecting');
});

redisClient.on('end', () => {
    console.log('Redis Client Connection Ended');
});

