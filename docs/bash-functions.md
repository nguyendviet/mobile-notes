## Custom Bash functions

Instead of typing a long AWS command, if I know I'll have to do it again and often, I'll add this to my `.bash_profile` (MacOS) or `.bashrc` (Linux):
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