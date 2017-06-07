# Contributors-Shield
## A tool to generate an image of the GitHub Repository's list of Contributors.

You can use the image generated in the README Markdown as well. 

### Feature Breakdown
* User inputs only the GitHub repository url
* Generates the image of the Contributors of the repo (test for large repos with optimizaton)
* Support high resolution images
* Image customization options (Title on image, Borders, Colors)
* Store the image generated in S3 and return the URL (with a proper folder structure)
* Have a Scheduled Lambda function to update the images weekly
* Have a graphical interface to generate the images and get the url
* Analytics

### Used Technologies
We have used AWS Services with the Serverless Framework (Lambda and API Gateway) and the source code is written in NodeJS. 


### Example

#### Contributors of the 99XT/contributors-shield 
![](https://github.com/99xt/contributors-shield/raw/master/generated_overlap.jpg)
___
