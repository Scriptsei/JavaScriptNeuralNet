function sigmoid(val)
{
	return 1 / (1 + Math.exp(-val));
}

function Neuron()
{
	this.iweights = new Array(); //array of doubles representing the weights of the input synapse (-1.0 to 1.0)
	this.inputs = new Array();	//array of the input Neurons to this Neuron will be empty for inputs
	this.output = 0; //current output state of this neuron (0 or 1)
	this.ivalue = 0.0; //the value of the inputs put through sigmoid
	this.tvalue = 0.5; //the threshold value of firing (default 0.5)

	//set the input neurons
	this.setInputs = function(_ins)
	{
		if(Array.isArray(_ins))
		{
			for (var i=0; i<_ins.length;i++)
			{
				this.inputs.push(_ins[i]);
				this.iweights.push(0.0);
			}
		}
		else
			return false;

		return true;

	}

	//set the weights of the inputs
	this.setWeights = function(_wts)
	{
		this.iweights = new Array();
		if(Array.isArray(_wts))
		{
			for (var i=0; i<_wts.length;i++)
				this.iweights.push(_wts[i]);
		}
		else
			return false;

		return true;
	}

	//calculate the output value of this neuron based on the value of the inputs
	this.calcOutput = function()
	{
		var _o = 0.0;

		if(this.iweights.length == this.inputs.length)
		{
			for (var i = 0; i<this.inputs.length; i++)
			{
				_o += this.inputs[i].output * this.iweights[i];
			}
		}
		else
			return false;

		this.ivalue = sigmoid(_o);
		if(this.ivalue > this.tvalue)
			this.output = 1;
		else
			this.output = 0;

		return true;
	}

	this.setTValue = function(t)
	{
		this.tvalue = t;
	}
}



function RowOfNeurons()
{
	this.neurons = new Array();

	this.setNeurons = function(_ns)
	{
		if(Array.isArray(_ns))
		{
			for(var i=0; i<_ns.length; i++)
				this.neurons.push(_ns[i]);
		}
		else
			return false;

		return true;
	}
}

function NeuralNet()
{
	this.inputl = new RowOfNeurons();
	this.outputl = new RowOfNeurons();
	this.hiddenlayers = new Array();

	//create a feed forward network of the given dimensions
	//numins = number of input neurons
	//numouts = number of output neurons
	//numhiddenls = number of hidden layers
	//numhidden = number of neurons in the hidden layers
	this.createFeedForward = function(numins, numouts, numhidden, numhiddenls)
	{
		//create a layer of neurons for input
		var _is = new Array();
		for(var i=0; i<numins; i++)
			_is.push(new Neuron());

		this.inputl.setNeurons(_is);

		//create a layer of neurons for input
		var _os = new Array();
		for(var i=0; i<numouts; i++)
			_os.push(new Neuron());

		this.outputl.setNeurons(_os);

		//create the layers of neurons the hidden layers
		for(var i=0; i<numhiddenls; i++)
		{
			var _hl = new RowOfNeurons();
			var _hns = new Array();
			for(var j=0; j<numhidden; j++)
				_hns.push(new Neuron());

			_hl.setNeurons(_hns);
			this.hiddenlayers.push(_hl);
		}

		//connect the inputs to the neurons
		for(var i=0; i<this.hiddenlayers.length; i++)
		{
			if(i==0)
			{
				for(var j=0; j<this.hiddenlayers[i].neurons.length; j++)
					this.hiddenlayers[i].neurons[j].setInputs(this.inputl.neurons);
			}
			else
			{
				for(var j=0; j<this.hiddenlayers[i].neurons.length; j++)
					this.hiddenlayers[i].neurons[j].setInputs(this.hiddenlayers[i-1].neurons);
			}
		}

		for(var i=0; i<this.outputl.neurons.length; i++)
			this.outputl.neurons[i].setInputs(this.hiddenlayers[this.hiddenlayers.length-1].neurons);
	}

	//set the values of the net inputs
	this.setInputs = function(_vals)
	{
		if(Array.isArray(_vals) && _vals.length == this.inputl.neurons.length)
		{
			for(var i=0; i<this.inputl.neurons.length; i++)
			{
				this.inputl.neurons[i].output = _vals[i];
			}
		}
	}

	//calculate the current network outputs
	this.calculateNetwork = function()
	{
		var _rv = true;

		for(var i=0; i<this.hiddenlayers.length; i++)
		{
			for(var j=0; j<this.hiddenlayers[i].neurons.length; j++)
				_rv = this.hiddenlayers[i].neurons[j].calcOutput();
		}

		for(var i=0; i<this.outputl.neurons.length; i++)
			_rv = this.outputl.neurons[i].calcOutput();

		return _rv;
	}

	this.getNumInputs = function()
	{
		return this.inputl.neurons.length;
	}

	this.getNumOutputs = function()
	{
		return this.outputl.neurons.length;
	}


	this.getNumHidden = function()
	{
		return this.hiddenlayers[0].neurons.length;
	}

	this.getNumHiddenNeurons = function()
	{
		return this.hiddenlayers[0].neurons.length * this.hiddenlayers.length;
	}

	this.getNumNeurons = function()
	{
		return this.getNumInputs() + this.getNumOutputs() + this.getNumHidden() * this.hiddenlayers.length;
	}

	this.getNumConnections = function()
	{
		var _h = this.getNumHidden();
		return _h * _h * (this.hiddenlayers.length - 1) + this.getNumOutputs() * _h + this.getNumInputs() * _h;
	}

	//set the weights of the neurons on the nets
	//_wts is an array of doubles
	//the net is represented as a grid and weights are assigned as such
	this.setWeights = function(_wts)
	{
		if(Array.isArray(_wts) && _wts.length == this.getNumConnections())
		{
			var _h = this.getNumHidden();
			var _is = this.getNumInputs() * _h;
			var _hs = _h * _h * (this.hiddenlayers.length-1);
			var _os = this.getNumOutputs() * _h;

			var _iwts = _wts.slice(0, _is);
			var _hwts = _wts.slice(_is, _is + _hs);
			var _owts = _wts.slice(_is + _hs, _is + _hs + _os);

			var _cw = 0;
			//go through the first hidden layer and set the weights of the neurons
			for(var i = 0; i<this.hiddenlayers[0].neurons.length; i++)
			{
				var _ciwt = _iwts.slice(_cw, _cw + this.hiddenlayers[0].neurons[i].iweights.length);
				this.hiddenlayers[0].neurons[i].setWeights(_ciwt);
				_cw += this.hiddenlayers[0].neurons[i].iweights.length;
			}

			_cw = 0
			//set the weights of the remaining hidden neurons
			for(var i = 1; i<this.hiddenlayers.length; i++)
			{
				for(var j = 0; j<this.hiddenlayers[i].neurons.length; j++)
				{
					var _ciwt = _hwts.slice(_cw, _cw + this.hiddenlayers[i].neurons.length);
					this.hiddenlayers[i].neurons[j].setWeights(_ciwt);
					_cw += this.hiddenlayers[i].neurons.length;
				}
			}

			_cw = 0
			//set the weights of the output layer
			for(var i = 0; i<this.outputl.neurons.length; i++)
			{
				var _ciwt = _owts.slice(_cw,_cw + this.outputl.neurons[i].iweights.length);
				this.outputl.neurons[i].setWeights(_ciwt);
				_cw += this.outputl.neurons[i].iweights.length
			}
		}
	}

	this.setTValues = function(_ts)
	{
		if(Array.isArray(_ts) && _ts.length == this.getNumHidden() + this.getNumOutputs())
		{
			var _ct = 0;
			for(var i = 0; i<this.hiddenlayers.length; i++)
			{
				for(var j = 0; j<this.hiddenlayers[i].neurons.length; j++)
				{
					this.hiddenlayers[i].neurons[j].tvalue = _ts[_ct];
					_ct++
				}
			}

			for(var i = 0; i<this.outputl.neurons.length; i++)
			{
				this.outputl.neurons[i].tvalue = _ts[_ct];
				_ct++
			}
		}
	}

	//return an array of binary values based on the output of the net
	this.getOutputs = function()
	{
		var out = new Array();

		for(var i=0; i<this.outputl.neurons.length; i++)
		{
			out.push(this.outputl.neurons[i].output);
		}
		return out;
	}

	this.getOutputAsChar = function()
	{
		var bin = 0;
		for(var i=0; i<this.outputl.neurons.length; i++)
		{
			bin = bin | (Math.pow(2,i) & (0 - this.outputl.neurons[i].output));
		}

		return String.fromCharCode(bin);
	}

	this.getOutputAsNumber = function()
	{
		var bin = 0;
		for(var i=0; i<this.outputl.neurons.length; i++)
		{
			bin = bin | (Math.pow(2,i) & (0 - this.outputl.neurons[i].output));
		}

		return bin;
	}

	this.getOutputAsBin = function()
	{
		var bin = "";
		for(var i=0; i<this.outputl.neurons.length; i++)
		{
			bin += this.outputl.neurons[i].output;
		}

		return bin;
	}
}