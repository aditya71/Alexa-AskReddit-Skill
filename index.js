/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = "amzn1.ask.skill.cafbda9f-8484-4dc7-8c14-42e1bef8d2b7";  // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'getReddit',
            GET_MESSAGE: 'The first post is: ',
            GET_COMMENT_MESSEGE: 'The replies to this posts are: ',
            HELP_MESSAGE: 'You can request comments of a question on ask reddit by simply saying,ask first reddit what are the top 5 posts of all time where the top is the catogory on ask reddit,'
            +'5 is the ammount of comments and all time is the time span of the specific request',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    }
};

const handlers = {
    'LaunchRequest': function () {
        //this.emit('Amazon.HelpIntent');
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'GetNewRedditIntent': function () {
        this.emit('GetReddit');
    },
    'GetReddit': function () {
        var GetRedditObj = this;

        

        const intentRequest = this.event.request;
        const section = intentRequest.intent.slots.Section.value;
        const NumberPost = intentRequest.intent.slots.NumberPost.value;
        const Times = intentRequest.intent.slots.Time.value;
        
        
        var http = require('https');
        var str = '';
        var str1 = '';
        var json1 = '';
        var json = '';
        var ID  = '';
        var title = '';
        var idLocation = 0;
        var x = false;
        var DOMAIN = 'www.reddit.com';
        var PATH = '/r/AskReddit/' + section + '.json?sort=' + section +'&t='+ Times +'&limit=1';
        var speechOutput;
        json = getJSON1(DOMAIN, PATH);
        //ID = json.data.children[0].data.id;
        //console.log(json);


        function getJSON1(Domain, path){
            if(section == 'new'){
                path = '/r/AskReddit/' + section + '.json?sort=' + section +'&limit=2'
                idLocation = 1;
            }
          console.log("1");
          var options = {
          host: Domain,
          path: path
          };

          var callback = function(response) {
            
            response.on('data', function (chunk) {
              //console.log("data");
              str += chunk;
            });

            response.on('end', function () {
              // your code here if you want to use the results !
              json = JSON.parse(str);
              ID = json.data.children[idLocation].data.id;
              title = json.data.children[idLocation].data.title;
              //console.log(json1);

              PATH = '/r/AskReddit/comments/' + ID + '.json?limit=' + (NumberPost*2);
              str = '';
              console.log("2");
              console.log(PATH);
              json = getJSON2(DOMAIN, PATH);
            });
          }
          var req = http.request(options, callback).end();
        }


        function getJSON2(Domain, path){
            console.log("3");
          var options = {
          host: Domain,
          path: path
          };

          var callback = function(response) {

            response.on('data', function (chunk) {
              //console.log("data");
              str += chunk;
            });

            response.on('end', function () {
              // your code here if you want to use the results !
              console.log("7");
              json = JSON.parse(str);
              for(var i = 0; i < NumberPost; i++){
                  console.log("8");
                  console.log(str1 + ID);
                  console.log(json[1].data.children[i]);
                  if(json[1] !== null && json[1].data.children[i] !== undefined){
                    str1+= "Comment "+ (i+1)+" "+json[1].data.children[i].data.body + "\n";
                  }else if(i === 0){
                      str1 += "there are no comments on this question"
                      break;
                  }else{
                      str1 += "there are no further comments on this question"
                      break;
                  }
                console.log("9");

              }
                console.log("4");
                speechOutput = 'The first post is: ' + title + 'The replies to this posts are:'  + str1;
                console.log(speechOutput);
                //this.emit(':tell', 'Hello World!');
                GetRedditObj.emit(':tellWithCard', speechOutput);
                //exiter(speechOutput);
                console.log("6");
                
            });
          }
          var req = http.request(options, callback).end();
        }

        function exiter(speechOutput){
            handlers[2].emit(':tellWithCard', speechOutput);
        }
        // Create speech output

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_REPROMPT');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appid = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
