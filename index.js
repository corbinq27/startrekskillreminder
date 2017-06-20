        var Alexa = require('alexa-sdk');

        var handlers = {
            'LaunchRequest': function () {
             this.emit(':ask', 'What Star Trek CCG card do you want to assign a skill to?');
            },
            'Unhandled': function() {
             this.emit(':ask', 'Ask me to set a skill to your Star Trek CCG Card.');
            },

            'SessionEndedRequest': function () {
            console.log('session ended!');
            this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
            },


            'SkillRemember': function () {
                //var filledSlots = delegateSlotCollection.call(this);
                var cardName = this.event.request.intent.slots.StarTrekCard.value
                var cardSkill = this.event.request.intent.slots.StarTrekSkill.value
                var ordinal = null
                var opponent = null
                //make sure a card and skill were mentioned
                if (!this.event.request.intent.slots.StarTrekCard.value) {
                    var slotToElicit = 'StarTrekCard';
                    var speechOutput = 'OK. Which card did you want to assign a skill to?';
                    var repromptSpeech = speechOutput;
                    this.emit(":elicitSlot", slotToElicit, speechOutput, repromptSpeech);
                }
                if (!this.event.request.intent.slots.StarTrekSkill.value){
                    var slotToElicit = 'StarTrekSkill';
                    var speechOutput = 'OK. Which skill did you want to assign to the ' + cardName + '?';
                    var repromptSpeech = speechOutput;
                    this.emit(":elicitSlot", slotToElicit, speechOutput, repromptSpeech);
                    console.log('elicited for a  Skill.');
                }
                // handle the outcomes



                if (this.event.request.intent.slots.index){
                    ordinal = this.event.request.intent.slots.index.value;
                }
                if (this.event.request.intent.slots.optionalOpponent){
                    opponent = this.event.request.intent.slots.optionalOpponent.value;
                }

                if (ordinal && opponent){
                    this.attributes[ordinal+opponent+cardName+cardSkill] = new Array(ordinal, opponent, cardName, cardSkill);
                    this.emit(':tell', 'OK.  I\'ve set the ' + ordinal + ' opponents copy of ' + cardName + ' with the skill of ' + cardSkill);
                }
                else if (ordinal) {
                    this.attributes[ordinal+cardName+cardSkill] = ordinal+','+cardName+','+cardSkill;
                    this.emit(':tell', 'OK.  I\'ve set the ' + ordinal + 'copy of ' + cardName + ' with the skill of ' + cardSkill);
                }
                else if (opponent) {
                    this.attributes[opponent+cardName+cardSkill] = opponent + ',' + cardName + ',' + cardSkill;
                    this.emit(':tell', 'OK.  I\'ve set the opponents copy of ' + cardName + ' with the skill of ' + cardSkill);
                }
                else {
                  this.attributes[cardName+cardSkill] = cardName + ',' + cardSkill;
                this.emit(':tell', 'OK.  I\'ve set the ' + cardName + ' with the skill of ' + cardSkill);
                }

              },

            'AMAZON.CancelIntent': function () {
                speechOutput = "";
                this.emit(':tell', speechOutput);
            },
            'AMAZON.StopIntent': function () {
                speechOutput = "";
                this.emit(':tell', speechOutput);
            },
            'SessionEndedRequest': function () {
                var speechOutput = "";
                this.emit(':tell', speechOutput);
            },

            'easyRecall': function() {
                console.log("This.attributes:");
                console.log(this.attributes);
                for (i=0; i < Object.keys(this.attributes).length; i++) {
                    console.log("This is item "+ i.toString() + " in attributes: " + this.attributes[i]);
                }


                if (isEmptyObject(this.attributes)) {
                    this.emit(':tell', 'there are no skills remembered.');
                }
                else {
                  var value;
                    Object.keys(this.attributes).forEach(function(key) {
                      value = map[key];
                      this.emit(':tell',value);
                    });
                }
                }
        };

        exports.handler = function(event, context, callback) {
            var alexa = Alexa.handler(event, context);

            alexa.dynamoDBTableName = 'STCCGSkillReminderDatabase'; // creates new table for userid:session.attributes

            alexa.registerHandlers(handlers);
            alexa.execute();
        };

function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}
