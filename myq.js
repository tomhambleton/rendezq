    
    function Subscriber(res) {
    	this.time = new Date();
    	this.res = res;
    }
    function Entry(from, msg) {
    	this.from = from;
    	this.msg = msg;
    }
    function Queue(name) {
    	this.name = name;
    	this.entries = new Array();
    	this.subscribers = new Array();
    }
    var myqTimeout = 10000;
    var fudgeValue = 2000;

    
	function MyQ() {
		this.queues = new Array();
		
		this.findQueue = function(name) {
			for (var i = 0; i< this.queues.length; i++) {
				if  ((this.queues[i] != undefined) && (this.queues[i].name == name)) {
					return i;
				}
			}
			return -1;
		};
	    this.handleMsgPost = function(req, res) {
			//console.log("In handleMsgPost");
			if ((req.body.to == undefined) || (req.body.to == "")) {
				var body = [{status:"ERROR",msg:"Missing to parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
			if ((req.body.from == undefined) || (req.body.from == "")) {
				var body = [{status:"ERROR",msg:"Missing from parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);				
				return;
			}
			if (req.body.msg == undefined) {
				var body = [{status:"ERROR",msg:"Missing msg parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);				
				return;
			}
            //console.log("to="+req.body.to);
            //console.log("from="+req.body.from);
            //console.log("msg="+req.body.msg);
			var idx = this.findQueue(req.body.to);
			if (idx >= 0) {
				var queue = this.queues[idx];
				if (queue.subscribers.length > 0) {
					for (var j = 0; j < queue.subscribers.length; j++) {
						var results = [{ status: "MSG", to: queue.name, from : req.body.from, msg : req.body.msg }];
						var subscriber = queue.subscribers[j];
						if (subscriber != undefined) {
							subscriber.res.contentType('json');
							subscriber.res.send(JSON.stringify(results));
						} else {
							console.log("Subscriber undefined, j="+j);
						}
					}
					var body = [{status:"MSG",msg:"Posted message"}];
					res.contentType('json');
					res.send(JSON.stringify(body));
					queue.subscribers = [];
				} else {
					if (queue.entries.length < 100) {
						queue.entries.push(new Entry(req.body.from, req.body.msg));
						var body = [{status:"MSG",msg:"Posted message"}];
						res.contentType('json');
						res.send(JSON.stringify(body));
					} else {
						var body = [{status:"ERROR",msg:"QUEUE FULL"}];
						res.contentType('json');
						res.send(JSON.stringify(body), 500);
					}
				}
			} else {
				//console.log("Adding queue:"+req.body.to);
				var newQueue = new Queue(req.body.to);
				newQueue.entries.push(new Entry(req.body.from, req.body.msg));
				this.queues.push(newQueue);
				var body = [{status:"MSG",msg:"Posted message"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			}
		};
	
		this.handleMsgPut = function(req, res) {
			//console.log("In handleMsgPut");
			if ((req.query.to === undefined) || (req.query.to === "")) {
				var body = [{status:"ERROR",msg:"Missing to parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
			if ((req.query.from === undefined) || (req.query.from === "")) {
				var body = [{status:"ERROR",msg:"Missing from parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);				
				return;
			}
			if (req.query.msg === undefined) {
				var body = [{status:"ERROR",msg:"Missing msg parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);				
				return;
			}
			var idx = this.findQueue(req.query.to);
			if (idx >= 0) {
				var queue = this.queues[idx];
				if (queue.subscribers.length > 0) {
					for (var j = 0; j < queue.subscribers.length; j++) {
						var results = [{ status: "MSG", to: queue.name, from : req.query.from, msg : req.query.msg }];
						var subscriber = queue.subscribers[j];
						if (subscriber != undefined) {
							subscriber.res.contentType('json');
							subscriber.res.send(JSON.stringify(results));
						} else {
							console.log("Subscriber undefined, j="+j);
						}
					}
					var body = [{status:"MSG",msg:"Posted message"}];
					res.contentType('json');
					res.send(JSON.stringify(body));
					queue.subscribers = [];
				} else {
					if (queue.entries.length < 100) {
						queue.entries.push(new Entry(req.query.from, req.query.msg));
						var body = [{status:"MSG",msg:"Posted message"}];
						res.contentType('json');
						res.send(JSON.stringify(body));
					} else {
						var body = [{status:"ERROR",msg:"QUEUE FULL"}];
						res.contentType('json');
						res.send(JSON.stringify(body), 500);
					}
				}
			} else {
				//console.log("Adding queue:"+req.query.to);
				var newQueue = new Queue(req.query.to);
				newQueue.entries.push(new Entry(req.query.from, req.query.msg));
				this.queues.push(newQueue);
				var body = [{status:"MSG",msg:"Posted message"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			}
		};
		this.handleMsgGet = function(req,res) {
			//console.log("In handleMsgGet");
			if (req.query.user === undefined) {
				var body = [{status:"ERROR",msg:"Missing user parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
			var idx = this.findQueue(req.query.user);
			if (idx >= 0) {
				var queue = this.queues[idx];
				if (queue.entries.length > 0) {
					var entry = queue.entries.shift();
                    //console.log("to="+queue.name);
                    //console.log("from="+entry.from);
                    //console.log("msg="+entry.msg);
					var results = [{ status: "MSG", to: queue.name,  from : entry.from, msg : entry.msg }];
					res.contentType('json');
                    var resultStr = JSON.stringify(results);
					res.send(resultStr);
				} else {
					//console.log("Adding new subscriber");
					queue.subscribers.push(new Subscriber(res));
				}
			} else {
				//console.log("Adding queue:"+req.query.user);
				var newQueue = new Queue(req.query.user);
				newQueue.subscribers.push(new Subscriber(res));
				this.queues.push(newQueue);
			}
		};
        this.handleMsgFlush = function(req,res) {
        	if (req.query.user === undefined) {
        		var body = [{status:"ERROR",msg:"Missing user parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
        	var idx = this.findQueue(req.query.user);
			if (idx >= 0) {
				var queue = this.queues[idx];
				if (queue.entries.length > 0) {
					queue.entries = [];
				}
				var body = [{status:"MSG",msg:"Queue flushed"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			} else {
				var body = [{status:"ERROR",msg:"Queue not found"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 404);
			}
		};
        this.handleLogin = function(req,res) {
            if (req.query.user == undefined) {
            var body = [{status:"ERROR",msg:"Missing user parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
        	var idx = this.findQueue(req.query.user);
			if (idx >= 0) {
				var queue = this.queues[idx];
				queue.entries = [];
				queue.subscribers = [];
				var body = [{status:"MSG",msg:"Queue Exists"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			} else {
				//console.log("Adding queue:"+req.query.user);
				var newQueue = new Queue(req.query.user);
				this.queues.push(newQueue);
				var body = [{status:"MSG",msg:"Queue Added"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			}
	    };
		this.handleAddQueue = function(req, res) {
			if (req.query.name === undefined) {
        		var body = [{status:"ERROR",msg:"Missing name parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
			var idx = this.findQueue(req.query.name);
			if (idx >= 0) {
				var queue = this.queues[idx];
				queue.entries = [];
				queue.subscribers = [];
				var body = [{status:"MSG",msg:"Queue Exists"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			} else {
				//console.log("Adding queue:"+req.query.name);
				var newQueue = new Queue(req.query.name);
				this.queues.push(newQueue);
				var body = [{status:"MSG",msg:"Queue Added"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			}
		};
		this.handleDelQueue = function(req, res) {
			if (req.query.name == undefined) {
        		var body = [{status:"ERROR",msg:"Missing name parameter"}];
				res.contentType('json');
				res.send(JSON.stringify(body), 400);
				return;
			}
			var idx = this.findQueue(req.query.name);
			if (idx >= 0) {
				var queue = this.queues[idx];
				queue.entries = [];
				queue.subscribers = [];
				var body = [{status:"MSG",msg:"Queue Deleted"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			} else {
				var body = [{status:"MSG",msg:"Queue Not Found"}];
				res.contentType('json');
				res.send(JSON.stringify(body));
			}
		};
		this.handleTimeout = function() {
			//console.log("MyQ Interval Timer");
			var currentTime = new Date();
			for (var i = 0; i< this.queues.length; i++) {
				if  (this.queues[i] != undefined) {
					var queue = this.queues[i];
					if (queue.subscribers.length > 0) {
						var keepGoing = true;
						while (keepGoing) {
							var subscriber = queue.subscribers[0];
							var diff = (currentTime.getTime() - subscriber.time.getTime()) + fudgeValue;
							if (diff >= myqTimeout) {
								var expiredSubscriber = queue.subscribers.shift();
								var results = [{status: "MSG", to: queue.name, from : "none", msg : "none" }];
								expiredSubscriber.res.contentType('json');
								expiredSubscriber.res.send(JSON.stringify(results));
								if (queue.subscribers.length == 0) 
									keepGoing = false;
							} else  {
								keepGoing = false;
							}
						}
					}
				}
			}
		};
		var self = this;
		this.timerId = setInterval(function() { 
			self.handleTimeout(); }, 
			myqTimeout/2);
	}

	exports.createMyQ = function() {
		return new MyQ();
	};

	exports.MyQ;
