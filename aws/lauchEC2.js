// Load the AWS SDK for Node.js
var AWS = require("aws-sdk");
require("dotenv").config();
// Load credentials and set region from JSON file
AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "/KGee",
  region: "ap-south-1",
});
console.clear();

// Create EC2 service object
var ec2 = new AWS.EC2({ apiVersion: "2016-11-15" });

// AMI is amzn-ami-2011.09.1.x86_64-ebs
var instanceParams = {
  ImageId: "ami-0f5ee92e2d63afc18",
  InstanceType: "t2.micro",
  KeyName: "ec2_key",
  MinCount: 1,
  MaxCount: 1,
  UserData: Buffer.from(
    `
    #!/bin/bash
    sudo apt update
    sudo apt install -y ffmpeg
  `
  ).toString("base64"), // Convert the user data to Base64 encoding
};
// Create a promise on an EC2 service object and then handle it
var instancePromise = new AWS.EC2({ apiVersion: "2016-11-15" })
  .runInstances(instanceParams)
  .promise();

instancePromise
  .then(function (data) {
    console.log(data);
    var instanceId = data.Instances[0].InstanceId;
    console.log("Created instance", instanceId);
    // Add tags to the instance
    tagParams = {
      Resources: [instanceId],
      Tags: [
        {
          Key: "creater_content",
          Value: "video compression creater_content",
        },
      ],
    };
    // Create a promise on an EC2 service object
    var tagPromise = new AWS.EC2({ apiVersion: "2016-11-15" })
      .createTags(tagParams)
      .promise();

    // Handle promise's fulfilled/rejected states for tagging
    tagPromise
      .then(function (data) {
        console.log("Instance tagged");
      })
      .catch(function (err) {
        console.error("Error tagging instance:", err);
      });
  })
  .catch(function (err) {
    console.error("Error launching EC2 instance:", err);
  });
