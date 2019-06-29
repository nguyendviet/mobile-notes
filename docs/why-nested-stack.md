## Why you should use CloudFormation nested stack

From [AWS docs](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-nested-stacks.html): 
> As your infrastructure grows, **common patterns** can emerge in which you declare the same components in multiple templates. You can separate out these **common components** and create dedicated templates for them. Then use the resource in your template to reference other templates, creating nested stacks.
...
Using nested stacks to declare common components is considered a best practice.

If you find yourself creating the same resouces over and over again, or similar resources tied together (like I do), then using "component templates" makes a lot of sense.