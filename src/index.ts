import {EC2} from 'aws-sdk';
import {exactTag, except, flatten, instanceAge, namedTag} from 'utils';

import {EC2Facade} from './ec2-facade';

const cronTagName = 'Cron';
const cronTagValue = 'Present';

class CreateTags {
    private project: string;
    private environment: string;
    private globalFilter: EC2.FilterList = [
        {Name: 'tag:Infrastructure', Values: ['mageops']},
    ];

    private projectFilter: EC2.FilterList;

    private appNodeFilter: EC2.FilterList = [
        {Name: 'tag:Role', Values: ['app']},
        {Name: 'instance-state-name', Values: ['running']},
    ];

    private ec2 = new EC2Facade();

    constructor() {
        const project = process.env['PROJECT'];
        if (!project) {
            throw Error('PROJECT not specified');
        }
        this.project = project;

        const environment = process.env['ENVIRONMENT'];
        if (!environment) {
            throw Error('ENVIRONMENT not specified');
        }
        this.environment = environment;
        console.log(
            `Using project: ${this.project}, environment: ${this.environment}`);

        this.projectFilter = [
            {Name: 'tag:Project', Values: [this.project]},
            {Name: 'tag:Environment', Values: [this.environment]},
        ];
    }

    async tagCron() {
        const reservations = await this.ec2.describeInstances({
            Filters: [
                ...this.globalFilter,
                ...this.projectFilter,
                ...this.appNodeFilter,
            ],
        });

        const instances =
            (reservations.Reservations ?? []).map(r => r.Instances)
            .filter((i): i is EC2.InstanceList => !!i)
            .reduce(flatten, [])
            .sort(instanceAge);

        const [oldest, ...rest] = instances;

        if (!oldest) {
            console.log(`There is no instances found!`);
            return;
        }

        const updates = [];

        if(!oldest.Tags?.find(exactTag(cronTagName, cronTagValue))) {
            updates.push(this.ec2.createInstanceTags(oldest, [
                {Key: cronTagName, Value: cronTagValue},
            ]));
        }

        for (const instance of rest) {
            if(instance.Tags?.find(exactTag(cronTagName, cronTagValue))) {
                updates.push(
                    this.ec2.deleteInstanceTags(
                        instance, instance.Tags.filter(namedTag(cronTagName))),
                );
            }
        }

        await Promise.all(updates);
    }
}

export async function handler() {
    const tagger = new CreateTags();
    await tagger.tagCron();

    return {
        statusCode: 200,
        body: 'OK',
    };
}
