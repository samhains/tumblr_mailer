var fs = require('fs');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('KjDYW2fwNDNYC46JwIT3Ng');

var ejs = require('ejs');
// Authenticate via OAuth
var tumblr = require('tumblr.js');

var client = tumblr.createClient({
  consumer_key: 'EeIUfLgUuHVOxltUf336AlmTAsHQIKcA8Yr1MzoYLjDRjMvUxn',
  consumer_secret: '5BAVClcO3pi5zPsSCvhUCUQxY9gueIZ7r6KpCG3MuRc5tFSKD5',
  token: '4GWgg5BNArOVgebRSXLYJUzn41qJ8UqFQXVD5sUjafPVn08fZy',
  token_secret: 'g1txjCQHNA6hlcDYxmYMAOexME4qrUajoMtyovCraeRiDYgzeK'
});



client.posts('sdlovecraft.tumblr.com', function(err, blog){

	var latestPosts = [];
	var posts = blog.posts;
	var sevenDaysAgo = new Date();

	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	for(var post in posts){

	  	var postDate = new Date(posts[post].date);
	  	if(postDate>sevenDaysAgo){
	  		latestPosts.push(posts[post]);


	  	}
    }

    //parse CSV for information on friends Emails;
    //
	friendList = csvParse(csvFile);
	friendList.forEach(function(obj){
		
		obj.latestPosts = latestPosts;
		customizedTemplate =  ejs.render(emailTemplate, obj);

		sendEmail(obj.firstName+" "+obj.lastName, obj.emailAddress,"Sam Hains",
			"sdh@eml.cc","New Posts On The Lovecraft",customizedTemplate);

	});
	


});



function csvParse(csvFile){
	var csvObj;
	var csvLines = csvFile.split('\n');	 var csvKeys = csvLines.shift().split(',');
	var arrayOfCSV = [];
	var csvValues;
	var customizedTemplate ;

	for(var line in csvLines){
		csvObj = {};
		csvValues = csvLines[line].split(',');

		for(var i=0;i<csvKeys.length; i++){
			csvObj[csvKeys[i]]= csvValues[i];

		}
		arrayOfCSV.push(csvObj);


	}
	return arrayOfCSV;


}

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });

}