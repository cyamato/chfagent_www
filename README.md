# CHFAgent_www

CHFAgent_www is an unofficial web frontend to the Kentik CHFAgent Flow Proxy software.  It allows you to easily see the status of the local running CHFAgent and the devices sending flow to it.

## Getting Started

- AWS:  Launch an EC2 instance using the public AMI "Unofficial Kentik CHFAgent AWS Virtual Appliance".  The Excel spreadsheet "CHFAgent AWS Virtual Appliance Calculator.xlsx" included in the root directory provides a simple calculator to help you chose the write EC2 size.

<center>

| EC2 Instance Size | Supported ~FPS | Supported ~# Devices |
| --- | --- | --- |
| c4.2xlarge | 24000 | 7 |
| c4.4xlarge | 48000 | 15 |
| c4.8xlarge | 108000 | 30 |
| c4.large | 6000 | 1 |
| c4.xlarge | 12000 | 3 |
| c5.18xlarge | 216000 | 72 |
| c5.2xlarge | 24000 | 8 |
| c5.4xlarge | 48000 | 16 |
| c5.9xlarge | 108000 | 36 |
| c5.large | 6000 | 2 |
| c5.xlarge | 12000 | 4 |
| m4.10xlarge | 120000 | 80 |
| m4.16xlarge | 192000 | 128 |
| m4.2xlarge | 24000 | 16 |
| m4.4xlarge | 48000 | 32 |
| m4.large | 6000 | 4 |
| m4.xlarge | 12000 | 8 |
| m5.12xlarge | 144000 | 96 |
| m5.24xlarge | 288000 | 192 |
| m5.2xlarge | 24000 | 16 |
| m5.4xlarge | 48000 | 32 |
| m5.large | 6000 | 4 |
| m5.xlarge | 12000 | 8 |

</center>

- Your Own Server:  Clone repository to a local directory.  It is recommended that you use a process manager such as PM2 to launch and control CHFAgent_www.

## Running

Access the web service on port 8080 with a web browser.  Login using your Kentik Administrator User (e-Mail address) and API Key.  Select "Config" from the menu and enter the Kentik User ID and API Key that CHFAgent will use as well as the IP address and Port number to which flow data will arrive.  Note that IP 0.0.0.0 instructs CHFAgnet to listen on all Interfaces. 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
