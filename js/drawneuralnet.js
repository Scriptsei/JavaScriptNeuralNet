//how big to draw the canvas
var windowWidth = 1170;
var windowHeight = 550;

//node alignment
var rMax = 20;
var vPaddingMax = 50;
var hPaddingMax = 250;
var iInset = 25;
var oInset = windowWidth-25;
var	hInset = 150;

//the pixel size we use
var psize = 15;

//connection stroke settings
var strokeSMax = 8;
var strokePos = "green";
var strokeNeg = "red";

//the thing we need to draw
var paper;
var inShapes;	//input neurons (circle)
var outShapes;  //output neurons (circle)
var procShapes; //middle layers (circle)
var connections; //the connections between neurons (line)

function draw(imode,omode)
{
	if(paper == null)
		paper = Raphael("drawarea", windowWidth, windowHeight);
	else
		paper.clear();

	inShapes = new Array();
	outShapes = new Array();
	procShapes = new Array();
	connections	= new Array();

	drawInputs(imode);
	drawOutputs(omode);
	drawHidden();
	drawConnections(imode,omode);
}

function drawInputs(disptype)
{
	var _r = windowHeight / inputs.length / vPaddingMax;
	var r = _r > 1 ? rMax : rMax * _r ;
	var vp = _r > 1 ? vPaddingMax : vPaddingMax * _r;
	var ihos = _r < 1 ? 0 : windowHeight/2 - inputs.length*vp/2;//figure out how much to offset the elements horizontally so that they align at the center of the canvas

	if(disptype == 0)
	{
		for(var i=0;i<inputs.length;i++)
		{
			var c = paper.circle(iInset, ihos + (i+1)*vp-r, r);
			c.data("i", i);
			c.click(function() {changeInput(this.data("i"))});
			if(inputs[i] == 1)
				c.attr("fill", "green");
			else
				c.attr("fill", "red");

			inShapes.push(c);

		}
	}

	else
	{
		var vinset = 25;
		var hinset = 30;
		var ol = paper.rect(hinset,vinset,(bitmapSqSize*psize) ,(bitmapSqSize*psize));

		for(var i=0;i<bitmapSqSize;i++)
		{
			for(var j=0;j<bitmapSqSize;j++)
			{
				var r = paper.rect(hinset + psize*j,vinset +  psize*i, psize , psize);
				r.data("i", i*bitmapSqSize + j);
				r.click(function() {changeInput(this.data("i"))});
				if(inputs[i*bitmapSqSize + j] == 1)
				{
					r.attr("fill", "black");
					r.attr("stroke", "black");
				}
				else
				{
					r.attr("fill", "white");
					r.attr("stroke", "white");
				}

				inShapes.push(r);
			}
		}
		ol.attr("fill", "white");
		ol.attr("stroke", "black");
		ol.attr("stroke-width", 2);
		ol.toBack();
	}

}

function changeInput(i)
{
	if(i<inputs.length && i<inShapes.length)
	{
		if(inputMode == 0)
		{
			if(inputs[i]==1)
			{
				inputs[i] = 0;
				inShapes[i].attr("fill", "red");
			}
			else
			{
				inputs[i] = 1;
				inShapes[i].attr("fill", "green");
			}
		}
		else
		{
			if(inputs[i] == 1)
			{
				inputs[i] = 0;
				inShapes[i].attr("fill", "black");
				inShapes[i].attr("stroke", "black");
			}
			else
			{
				inputs[i] = 1;
				inShapes[i].attr("fill", "white");
				inShapes[i].attr("stroke", "white");
			}
		}
	}

	net.setInputs(inputs);
	refreshSettings(null,null,null);
}

function drawOutputs(disptype)
{
	var _r = windowHeight / net.outputl.neurons.length / vPaddingMax;
	var r = _r > 1 ? rMax : rMax * _r ;
	var vp = _r > 1 ? vPaddingMax : vPaddingMax * _r ;
	var ihos = _r < 1 ? 0 : windowHeight/2 - net.outputl.neurons.length*vp/2;//figure out how much to offset the elements horizontally so that they align at the center of the canvas

	if(disptype == 0)
	{
		for(var i=0;i<net.outputl.neurons.length;i++)
		{
			var c = paper.circle(oInset, ihos + (i+1)*vp-r, r * net.outputl.neurons[i].tvalue / tValMed);
			c.data("i", i);
			//c.hover();
			if(net.outputl.neurons[i].output == 1)
				c.attr("fill", strokePos);
			else
				c.attr("fill", strokeNeg);
			outShapes.push(c);
		}
	}
	if(disptype == 1 || disptype == 2)
	{
		var s = "";
		if(disptype == 1)
			s = net.getOutputAsNumber();
		else
			s = net.getOutputAsChar();

		var t = paper.text(oInset - 50,windowHeight/2,s);
		//t.attr("font",);
		t.attr("font-weight","bold");
		t.attr("font-size", 72);
		outShapes.push(t);
	}

}

function drawHidden()
{
	var _r1 = windowHeight / net.hiddenlayers[0].neurons.length / vPaddingMax;
	var _r2 = inputMode == 0 ? (windowWidth - 2*hInset) / net.hiddenlayers.length / hPaddingMax : (windowWidth - hInset - 30 - bitmapSqSize * psize) / net.hiddenlayers.length / hPaddingMax ;

	var _r = _r1 < _r2 ? _r1  : _r2;
	var r = _r > 1 ? rMax : rMax * _r;
	var vp = _r1 > 1 ? vPaddingMax : vPaddingMax * _r1;
	var hp = _r2 > 1 ? hPaddingMax : hPaddingMax * _r2;

	var ihos = _r1 < 1 ? 0 : windowHeight/2 - net.hiddenlayers[0].neurons.length*vp/2;//figure out how much to offset the elements horizontally so that they align at the center of the canvas
	var adj = 150 / _r > 150 ? 150 :  150 / _r;
	var ivos = inputMode == 0 ? windowWidth/2 - (net.hiddenlayers.length - 1)*hp/2 :  windowWidth/2 - (net.hiddenlayers.length - 1)*hp/2 + 150;

	for(var i=0;i<net.hiddenlayers.length;i++)
	{
		for(var j=0;j<net.hiddenlayers[i].neurons.length;j++)
		{
			var c = paper.circle(ivos + (i)*hp, ihos + (j+1)*vp-r, r * net.hiddenlayers[i].neurons[j].tvalue / tValMed);

			if(net.hiddenlayers[i].neurons[j].output == 1)
				c.attr("fill", "green");
			else
				c.attr("fill", "red");
			procShapes.push(c);
		}
	}
}

function drawConnections(idisp, odisp)
{
	var _cw = idisp == 1 ? net.hiddenlayers[0].neurons.length : 0;

	for(var i=idisp;i<net.hiddenlayers.length;i++)
	{
		for(var j=0;j<net.hiddenlayers[i].neurons.length;j++)
		{
			for(var k=0;k<net.hiddenlayers[i].neurons[j].iweights.length;k++)
			{
				if(i==0)
					var pths = "M" + procShapes[_cw].attr("cx") + "," + procShapes[_cw].attr("cy") + "L" + inShapes[k].attr("cx") + "," + inShapes[k].attr("cy");
				else
					var pths = "M" + procShapes[_cw].attr("cx") + "," + procShapes[_cw].attr("cy") + "L" + procShapes[(i - 1) * net.hiddenlayers[i].neurons.length + k].attr("cx") + "," + procShapes[(i - 1) * net.hiddenlayers[i].neurons.length + k].attr("cy");

				var s = paper.path(pths);
				var wt = net.hiddenlayers[i].neurons[j].iweights[k];
				if(wt > 0 )
					s.attr("stroke","green");
				else
					s.attr("stroke","red");

				s.attr("stroke-width",strokeSMax * Math.abs(wt));
				s.attr("stroke-linecap", "round");
				s.toBack();
				connections.push(s);
			}
			_cw++;
		}
	}

	for(var i=odisp*net.outputl.neurons.length;i<net.outputl.neurons.length;i++)
	{
		for(var j=0;j<net.outputl.neurons[i].iweights.length;j++)
		{
			var pths = "M" + outShapes[i].attr("cx") + "," + outShapes[i].attr("cy") + "L" + procShapes[procShapes.length - j - 1].attr("cx") + "," + procShapes[procShapes.length - j - 1].attr("cy");
			var s = paper.path(pths);
			var wt = net.outputl.neurons[i].iweights[j];
			if(wt > 0 )
				s.attr("stroke","green");
			else
				s.attr("stroke","red");

			s.attr("stroke-width",10 * Math.abs(wt));
			s.attr("stroke-linecap", "round");
			s.toBack();
			connections.push(s);
		}
	}
}