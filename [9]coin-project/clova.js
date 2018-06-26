module.exports = (app) => {

	class CEKRequest {
	  constructor (req, res) {
	    this.request = req.body.request;	    
	    this.context = req.body.context;
	    this.session = req.body.session;
	    this.response = res;
	    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
	  }

	  do(response) {
	    switch (this.request.type) {
	      case 'LaunchRequest':
	        return this.launchRequest(response);
	      case 'IntentRequest':
	        return this.intentRequest(response);
	      case 'SessionEndedRequest':
	        return this.sessionEndedRequest(response);
	    }
	  }

	  launchRequest(response) {
	    console.log('launchRequest');
	    response.setSimpleSpeechText('코인 프리미엄 정보를 알려드립니다.');
	    response.setMultiturn({
	      intent: 'CoinCheckIntent',
	    });
	  }

	  intentRequest(response) {
	    console.log('intentRequest');
	    console.dir(this.request);
	    const intent = this.request.intent.name;
	    const slots = this.request.intent.slots;

	    switch (intent) {
	    case 'CoinCheckIntent':
	    default:	      

	      if(slots.premium){	      	

	      	app.getPremium().then((data) => {	      		
	      		response.appendSpeechText(`김프 시세 차이는 ${data.premium_price}원, ${data.premium_percent}% 입니다.`);
	      		return this.response.send(response);
	      	});	      	
	      } else {

	      	if(slots.currency){
	      		const currency = slots.currency.value;
	      		if(currency=='비트코인' || currency=='비코'){	      				      		
	      			app.getPrice('btc').then((data) => {
	      				response.appendSpeechText(`비트코인 가격은 ${data.value}원 입니다.`);
	      				return this.response.send(response);
	      			});

	      		} else if(currency=='이더리움' || currency=='이더'){
	      			app.getPrice('eth').then((data) => {
	      				response.appendSpeechText(`이더리움 가격은 ${data.value}원 입니다.`);
	      				return this.response.send(response);
	      			});
	      		} else if(currency=='리플'){
	      			app.getPrice('xrp').then((data) => {
	      				response.appendSpeechText(`리플 가격은 ${data.value}원 입니다.`);
	      				return this.response.send(response);
	      			});
	      		}
	      	}
	      }
	      
	      break;
	    }
	   
	  }

	  sessionEndedRequest(response) {
	    console.log('sessionEndedRequest');
	    response.setSimpleSpeechText('코인 정보 봇을 종료합니다.');
	    response.clearMultiturn();
	  }
	}

	class CEKResponse {
	  constructor () {
	    console.log('CEKResponse constructor')
	    this.response = {
	      directives: [],
	      shouldEndSession: true,
	      outputSpeech: {},
	      card: {},
	    };
	    this.version = '0.1.0';
	    this.sessionAttributes = {};
	  }

	  setMultiturn(sessionAttributes) {
	    this.response.shouldEndSession = false;
	    this.sessionAttributes = Object.assign(this.sessionAttributes, sessionAttributes);
	  }

	  clearMultiturn() {
	    this.response.shouldEndSession = true;
	    this.sessionAttributes = {};
	  }

	  setSimpleSpeechText(outputText) {
	    this.response.outputSpeech = {
	      type: 'SimpleSpeech',
	      values: {
	          type: 'PlainText',
	          lang: 'ko',
	          value: outputText,
	      },
	    };
	  }

	  appendSpeechText(outputText) {
	    const outputSpeech = this.response.outputSpeech;
	    if (outputSpeech.type != 'SpeechList') {
	      outputSpeech.type = 'SpeechList';
	      outputSpeech.values = [];
	    }
	    if (typeof(outputText) == 'string') {
	      outputSpeech.values.push({
	        type: 'PlainText',
	        lang: 'ko',
	        value: outputText,
	      });
	    } else {
	      outputSpeech.values.push(outputText);
	    }
	  }
	}

	app.post('/clova', (req, res, next) => {
	  const cekResponse = new CEKResponse();
	  const cekRequest = new CEKRequest(req, res);
	  cekRequest.do(cekResponse);	  
	});

}
