import {EC2} from 'aws-sdk';

export class EC2Facade {
    protected ec2 = new EC2();


    describeInstances(req: EC2.DescribeInstancesRequest):
        Promise<EC2.DescribeInstancesResult> {
        return new Promise(
            (resolve, reject) =>
                this.ec2.describeInstances(req, (err, data) => {
                    if (!!err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }));
    }

    createTags(req: EC2.CreateTagsRequest): Promise<{}> {
        return new Promise(
            (resolve, reject) => this.ec2.createTags(req, (err, data) => {
                if (!!err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }));
    }

    deleteTags(req: EC2.DeleteTagsRequest): Promise<{}> {
        return new Promise(
            (resolve, reject) => this.ec2.deleteTags(req, (err, data) => {
                if (!!err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            }));
    }

    createInstanceTags(instance: EC2.Instance, tags: EC2.TagList): Promise<{}> {
        const id = instance.InstanceId;
        if (!id) {
            throw Error('InstanceId is missing');
        }
        return this.createTags({
            Resources: [id],
            Tags: tags,
        });
    }

    deleteInstanceTags(instance: EC2.Instance, tags: EC2.TagList): Promise<{}> {
        const id = instance.InstanceId;
        if (!id) {
            throw Error('InstanceId is missing');
        }
        return this.deleteTags({
            Resources: [id],
            Tags: tags,
        });
    }
}
