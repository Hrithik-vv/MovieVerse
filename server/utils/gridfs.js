const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

function getBucket() {
  if (bucket) return bucket;
  const connection = mongoose.connection;
  if (connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
  bucket = new GridFSBucket(connection.db, { bucketName: 'banners' });
  return bucket;
}

module.exports = { getBucket };


