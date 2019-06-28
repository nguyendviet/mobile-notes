# CloudFormation templates

Guide to deploy CloudFormation nested stack to create the full serverless mobile notes app described [here](../README.md).

## Step 1: Set up your template bucket
- After cloning this repository:
- Create a bucket that will contain all the templates (`.json` files). Don't make this bucket public unless you want to share your templates.
- You can use a CloudFormation template, the CLI or the Console to create this bucket.
- I recommend you turn on Version Control and Server access logging for this bucket if you plan to keep using this bucket for more templates in the future.
- Upload all template (`.json` files) in this folder, except `root-stack.json` because you don't need it in the bucket.

## Step 2: Deploy the templates
- Make sure you have all the permissions you need to all the services that these nested-stack templates will create: CloudFormation, S3, Cognito, API Gateway, Lambda, DynamoDB, IAM.
- Make sure you have the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed on your machine.
- Change the `YOUR_TEMPLATE_BUCKET` value in file `./cloudformation/root-stack.json` with your real template bucket name that you created in **Step 1**.
- Run:
```bash
aws cloudformation create-stack --stack-name <YOUR_STACK_NAME> --template-body file://<PATH_TO_THE_ROOT_STACK_TEMPLATE>/root-stack.json --capabilities CAPABILITY_IAM
```
- Then wait. You can check the status of the creation of the nested stack in your Console.
- Once your stack (the parent stack, not the nested ones) has the status `CREATE_COMPLETE`, go to its Outputs, you should be able to see all the variables you need for your React code, and also YOUR-APP-URL (`WebsiteUrl`).

## Step 3: Set up the app and test locally
- Go to AWS Console > Lambda > Lambda Function created by the nested stack template > Function code > Code entry type > Select Upload a .zip file then choose the file `./cloudformation/lambda/lambda.zip`. Then remember to Save your function. 
- *I know there are other ways to deploy your Lambda code like using SAM, or uploading the .zip file to an S3 bucket so you can use CloudFormation template to retrieve the .zip file from that bucket to your Lambda function, but I'll leave that for you to explore.* 
- Copy the values you need for the file `aws-variables.js` inside this project: `./mobile-notes/client/src/lib/aws-variables.js`
```javascript
export default {
    s3: {
        REGION: "YOUR_AWS_REGION",
        BUCKET: "YOUR_S3_WEBSITE_BUCKET"
    },
    apiGateway: {
        REGION: "YOUR_AWS_REGION",
        URL: "YOUR_API_GATEWAY_INVOKE_URL"
    },
    cognito: {
        REGION: "YOUR_AWS_REGION",
        USER_POOL_ID: "YOUR_USER_POOL_ID",
        APP_CLIENT_ID: "YOUR_APP_CLIENT_ID",
        IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID"
    }
};
```
- Make sure you have [yarn](https://yarnpkg.com/lang/en/docs/cli/install/) and [Node.js](https://nodejs.org/en/download/package-manager/) installed on your computer. 
- Go to folder `./client`.
- Inside `./client` folder, install dependencies:
```
$ yarn install
```
- Make a build folder:
```
$ yarn build
```
- Copy the content inside the build folder to your S3 bucket (you don't have to exclude .DS_Store if you run on Linux, I pasted the command here for Mac users' convenience):
```
$ aws s3 cp <PATH>/build s3://<YOUR_S3_WEBSITE_BUCKET> --recursive --exclude ".DS_Store"
```
- Start the app locally:
```
$ yarn start
```
- You should be able to see the app on your browser (`localhost:3000`) and it will look like the one you set up manually if you have done it following the guide [here](../README.md).
- Now you can create your account and start writing some notes to test.

## Step 5: Try the app online
- Go to YOUR-APP-URL that you got from the Outputs of your root stack template. 
- Now you can create another account or login (if you have already created one from your local host) and see the notes you've written (if you have done so) that are pulled from `DynamoDB`.

## Step 6: Get better at it
- Use [SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) to develop your Serverless app.
- Use [taskcat](https://github.com/aws-quickstart/taskcat) to test your CloudFormation templates.
- Use custom bash scripts and alias to save time. For example, instead of typing a long AWS command, if I know I'll have to do it again and often, I'll add this to my `.bash_profile` (MacOS) or `.bashrc` (Linux):
```bash
# remove all objects in an AWS S3 bucket
s3_remove() {
    aws s3 rm s3://"$1" --recursive
}

# copy all files in a local folder to an AWS S3 bucket
s3_copy() {
    aws s3 cp "$1" s3://"$2" --recursive --exclude ".DS_Store"
}

# create a CloudFormation stack from a json template
# depends on the template, it's required to have
# CAPABILITY_IAM, CAPABILITY_NAMED_IAM or CAPABILITY_AUTO_EXPAND
# if there is a 3rd arg, take the args from the 3rd one to the end as parameters
cloudformation_create() {
    if [ -z "$3" ]; then
        aws cloudformation create-stack --stack-name "$1" --template-body file://"$2" --capabilities CAPABILITY_IAM
    else
        aws cloudformation create-stack --stack-name "$1" --template-body file://"$2" --parameters "${@:3}" --capabilities CAPABILITY_IAM
    fi
}

alias s3-rm="s3_remove"
alias s3-cp="s3_copy"
alias cf-create="cloudformation_create"
```
So if I need to create a stack, I can just run:
```bash
cf-create <STACK_NAME> <PATH>/<STACK_TEMPLATE>.json
```
Or if I need to empty an S3 bucket:
```bash
s3-rm <BUCKET_NAME>
```
Or upload the build folder to an S3 bucket to host as static website:
```bash
s3-cp <BUILD_FOLDER> <BUCKET_NAME>
```
Or go further and [create a pipeline to automate your website deployment](https://www.linkedin.com/pulse/provision-your-pipeline-automate-static-site-aws-viet-nguyen/).