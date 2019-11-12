const Converter = require('./Converter');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const Bucket = 'cloudios.development.interactive-expose-service';

async function run() {
    s3.listObjects({Bucket: Bucket, Prefix: 'iex-templates'}, (error, data) => {
        if (error) {
            return console.error(error, error.stack)
        }

        data.Contents.forEach(s3Data => {
            if (!s3Data.Key.endsWith('defaultMapping.json')) {
                return;
            }

            s3.getObject({Bucket: Bucket, Key: s3Data.Key}, (error, data) => {
                if (error) {
                    return console.error(error, error.stack)
                }

                try {
                    const mappingV1 = JSON.parse(data.Body.toString());
                    const mappingV2 = Converter.convertMapping(mappingV1);
                    const folder = s3Data.Key.replace('/defaultMapping.json', '');

                    s3.upload({
                        Bucket: Bucket,
                        Key: `${folder}/defaultMappingV1.json`,
                        Body: Buffer.from(JSON.stringify(mappingV1, null, 2), 'utf8')
                    }, (error) => {
                        if (error) {
                            return console.error('Could not upload V1 file');
                        }
                        console.log(`File successful uploaded ${folder}/defaultMappingV1.json.`)
                    });

                    s3.upload({
                        Bucket: Bucket,
                        Key: `${folder}/defaultMapping.json`,
                        Body: Buffer.from(JSON.stringify(mappingV2, null, 2), 'utf8')
                    }, (error) => {
                        if (error) {
                            return console.error('Could not upload file');
                        }
                        console.log(`File successful uploaded ${folder}/defaultMapping.json.`)
                    });
                } catch (error) {
                    console.error(`Could not convert the mapping ${s3Data.Key}`, error);
                }
            });
        });
    });
}

// noinspection JSIgnoredPromiseFromCall
run();
