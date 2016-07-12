var nock = require("nock");
var CatapultClient = require("../index");

var baseUrl = "https://api.catapult.inetwork.com";

describe("Bridge API", function () {

	describe("global methods", function () {
		var client;

		var userId = "fakeUserId";
		var apiToken = "fakeApiToken";
		var apiSecret = "fakeapiSecret";

		var newTestBridge = {
			bridgeAudio : true,
			callIds     : [ "callId" ]
		};

		var changes = {
			bridgeAudio : true,
			callIds     : [ "callId1" ]
		};

		var testBridge = {
			"id"            : "bridgeId",
			"state"         : "completed",
			"bridgeAudio"   : "true",
			"calls"         :"https://.../v1/users/{userId}/bridges/{bridgeId}/calls",
			"createdTime"   : "2013-04-22T13:55:30.279Z",
			"activatedTime" : "2013-04-22T13:55:30.280Z",
			"completedTime" : "2013-04-22T13:59:30.122Z"
		};

		var bridgesList = [ testBridge	];

		var callsList = [
			{
				"id"                 : "fakeCallId1",
				"direction"          : "out",
				"from"               : "{fromNumber}",
				"to"                 : "{toNumber1}",
				"recordingEnabled"   : false,
				"callbackUrl"        : "",
				"state"              : "completed",
				"startTime"          : "2013-02-08T13:15:47.587Z",
				"activeTime"         : "2013-02-08T13:15:52.347Z",
				"endTime"            : "2013-02-08T13:15:55.887Z",
				"chargeableDuration" : 60,
				"events"             : "https://.../calls/fakeCallId1/events"
			},
			{
				"id"               : "fakeCallId2",
				"direction"        : "out",
				"from"             : "{fromNumber}",
				"to"               : "{toNumber2}",
				"recordingEnabled" : false,
				"callbackUrl"      : "",
				"state"            : "active",
				"startTime"        : "2013-02-08T13:15:47.587Z",
				"activeTime"       : "2013-02-08T13:15:52.347Z",
				"events"           : "https://.../calls/fakeCallId2/events"
			}
		];

		var tag = "tag";
		var sampleSentence = "Hello world";
		var speakSentencePayload = {
			sentence : sampleSentence
		};

		var speakSentencePayloadWithTag = {
			sentence : sampleSentence,
			tag      : tag
		};

		var audioUrl = "http://somewhere/something.mp3";
		var playAudioPayload = {
			fileUrl : audioUrl
		};

		var playAudioPayloadWithTag = {
			fileUrl : audioUrl,
			tag     : tag
		};

		before(function () {
			client = new CatapultClient({
				userId    : userId,
				apiToken  : apiToken,
				apiSecret : apiSecret
			});
			nock.disableNetConnect();

			nock("https://api.catapult.inetwork.com")
				.persist()
				.post("/v1/users/" + userId + "/bridges", newTestBridge)
				.reply(201,
					{},
					{
						"Location" : "/v1/users/" + userId + "/bridges/fakeBridgeId"
					})
				.get("/v1/users/" + userId + "/bridges/" + testBridge.id)
				.reply(200, testBridge)
				.get("/v1/users/" + userId + "/bridges?size=100")
				.reply(200, bridgesList)
				.post("/v1/users/" + userId + "/bridges/" + testBridge.id + "/audio", speakSentencePayload)
				.reply(200)
				.post("/v1/users/" + userId + "/bridges/" + testBridge.id + "/audio", playAudioPayload)
				.reply(200)
				.post("/v1/users/" + userId + "/bridges/" + testBridge.id + "/audio", speakSentencePayloadWithTag)
				.reply(200)
				.post("/v1/users/" + userId + "/bridges/" + testBridge.id + "/audio", playAudioPayloadWithTag)
				.reply(200)
				.post("/v1/users/" + userId + "/bridges/" + testBridge.id, changes)
				.reply(200)
				.get("/v1/users/" + userId + "/bridges/" + testBridge.id + "/calls")
				.reply(200, callsList);
		});

		after(function () {
			nock.cleanAll();
			nock.enableNetConnect();
		});

		it("should create a bridge, promise style", function () {
			return client.Bridge.create(newTestBridge)
			.then(function (bridge) {
				bridge.should.eql(newTestBridge);
			});
		});

		it("should create a bridge, callback style", function (done) {
			client.Bridge.create(newTestBridge, function (err, call) {
				if (err) {
					throw err;
				}
				call.should.eql(newTestBridge);
				done();
			});
		});

		it("should get a bridge, promise style", function () {
			return client.Bridge.get(testBridge.id)
			.then(function (bridge) {
				bridge.should.eql(testBridge);
			});
		});

		it("should get a list of bridges, promise style", function () {
			return client.Bridge.list({ size : 100 })
			.then(function (bridges) {
				bridges[0].should.eql(bridgesList[0]);
			});
		});

		it("should get a list of bridges, callback style", function (done) {
			client.Bridge.list({ size : 100 }, function (err, bridges) {
				if (err) {
					throw err;
				}
				bridges[0].should.eql(bridgesList[0]);
				done();
			});
		});

		it("should speak a sentence to the bridge", function () {
			return client.Bridge.speakSentence(testBridge.id, sampleSentence);
		});

		it("should speak a sentence to the bridge (with params)", function () {
			return client.Bridge.speakSentence(testBridge.id, sampleSentence, { tag : tag });
		});

		it("should play an audio file on sentence to the bridge", function () {
			return client.Bridge.playAudio(testBridge.id, audioUrl);
		});

		it("should play an audio file on sentence to the bridge (with params)", function () {
			return client.Bridge.playAudio(testBridge.id, audioUrl, { tag : tag });
		});

		it("should update the bridge, promise style", function () {
			return client.Bridge.update(testBridge.id, changes);
		});

		it("should get a list of calls for the bridge, promise style", function () {
			return client.Bridge.getCalls(testBridge.id)
			.then(function (calls) {
				calls[0].should.eql(callsList[0]);
				calls[1].should.eql(callsList[1]);
			});
		});
	});
});
