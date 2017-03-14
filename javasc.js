
//mm
var dezo = 100;
var fyzpoloha = 240;
var delici_poloha = 250.0;
var delici_poloha2 = 270;
var len = 500.0;


var    pars = [
{num:34010, name:"REF_CAM_DIR_IS_MINUS", text:"referování se rozjede do (+ 0) nebo (- 1)", val:0},
{num:34020, name:"REF_VELO_SEARCH_CAM", text:"Rychlost hledání referenčního snímače", val:5000},
{num:34030, name:"REFP_MAX_CAM_DIST", text:"Maximální vzdálenost k dojetí z akt. místa na ref. snímač", val:10000},
{num:34040, name:"REFP_VELO_SEARCH_MARKER", text:"Rychlost najíždění z referenčního snímače na nulový bod enkodéru - fáze2", val:300},
{num:34050, name:"REFP_SEARCH_MARKER_REVERSE", text: "Pokud nula tak po najetí na ref snímač se rozjede zpátky a hledá nulový bod <br> pokud jedna tak se rozjede zpátky, sjede z vačky a zase pojede na vačku a hledá nulový bod enkodéru ", val:0},
{num:34060, name:"REFP_MAX_MARKER_DIST", text:"Maximální vzdálenost nulového bodu enkodéru od hrany vačky (cca jedna otáčka)", val:20},
{num:34070, name:"REFP_VELO_POS", text:"Rychlost nájezdu do ref. bodu - už bylo sme najeli na nulový bod enkodéru a ted bude najíždět na referenční pozici touhle rychlostí", val:10000},
{num:34080, name:"REFP_MOVE_DIST", text:"Vzdálenost z nulového bodu enkodéru do referenčního bodu, která se má ujet", val:-2},
{num:34090, name:"REFP_MOVE_DIST_CORR", text:"Korekce parametru výše - přičte se nebo odečte; pokud je absolutní enkodér tak je to rozdíl od fyzické polohy na ose a naměřené polohy z enkodéru", val:0},
{num:34092, name:"REFP_CAM_SHIFT", text:"při najíždění na referenční vačku nepřejde hned do fáze 2, ale ještě pojede o tuhle vzdálenost dále - reprodukovatelnost", val:0},
{num:34093, name:"REFP_CAM_MARKER_DIST", text:"Pro čtení - říká jak bylo daleko od referenční vačky do nulového bodu enkodéru", val:0},
{num:34100, name:"REFP_SET_POS", text:"Tuhle hodnotu tam strčí jak dojede na referenčího místo", val:0},
{num:34210, name:"ENC_REFP_STATE", text:"absolutní enkodér - musí být 2 aby systém věřil že je zkalibrováno", val:2},

//{num:31020, name : "ENC_RESOL", text: "Počet pulzů na otáčku"},
//{num:31030, name :"LEADSCREW_PITCH" , text: "stoupání šroubu"},

];

function render()
{
	//width - 2 * margin <=> 500mm

	//px
	var width = 800;
	var height = 300;
	var xmargin = 50;
	var ymargin = 50;
	x_margin = dezo;
	dezo = dezo + 50;
	var half = delici_poloha/len * (width - 2* xmargin) + xmargin;
	var half2 = delici_poloha2/len * (width - 2*xmargin) + xmargin;

	var canvas = document.getElementById('myCanvas'),
    context = canvas.getContext('2d');

	var $myCanvas = $('#myCanvas');

	var toolpos = fyzpoloha / len * (width - 2*xmargin ) + xmargin;

$myCanvas.clearCanvas();

$myCanvas.drawRect({
  fillStyle: 'steelblue',
  strokeStyle: 'blue',
  strokeWidth: 4,
  x: xmargin, y: height - ymargin,
  fromCenter: false,
  width: width - 2 * xmargin,
  height: 10
});

	$myCanvas.drawRect(
	{
	  fillStyle: 'lightgreen',
  strokeStyle: 'green',
  strokeWidth: 0,
  x: half, y: height - ymargin - 40,
  fromCenter: false,
  width: half2 - half ,
  height: 50
	}
	);

		$myCanvas.drawRect(
	{
  fillStyle: 'red',
  strokeStyle: 'red',
  strokeWidth: 0 ,
  x: toolpos, y: height - ymargin - 80 - 1,
  fromCenter: false,
  width: 2,
  height: 80
	}
	);



}

var poloha_lcd = 0;
var state_machine = 6;

function vacka_jo()
{
	 var vacka = (fyzpoloha > delici_poloha && fyzpoloha < delici_poloha2);
	 var v_t;
	 if (vacka)
	 {
	 	v_t = "vačka jo" ;
	 }
	 else
	 {
	 	v_t = "vačka ne";
	 }
	 $("#vacka").text(v_t);

	$("#osa").text(poloha_lcd.toFixed(2));
	$("#osa2").text(fyzpoloha.toFixed(2));

	return vacka;
}


var override ;
var time_step = 1; //ms
function getStep(value)
{

        override = Number($("#override_slider").val());
	return value / 60 * time_step / 1000 * (override / 100);
	//krát override here a je to zpomaleny
}

var intervalID;

fyzpoloha = 250;
var rel_poloha = 0;
var krokovani = false;
var old_state_machine = 0;
function timeout()
{
	var vacka = vacka_jo();
	//period 0.1s
	//rychlost je v jednotkách za minutu

	var vsc   = $("#p34020").val();
	var minus = $("#p34010").val();
	var vsm   = $("#p34040").val();
	var shift = $("#p34092").val();
	var smr   = $("#p34050").val();
	var velopos  = $("#p34070").val();
	var movedist = Number($("#p34080").val());
	var movecorr = Number($("#p34090").val());

	if (state_machine == 0)
	{
		var speed_step = getStep(vsc);
		if (vacka == 1)
		{
			speed_step *= -1;
		}
		else
		{
			state_machine = 1;
		}
		if (minus == 1)
		{
			speed_step *= -1;
		}
		fyzpoloha += speed_step;
	  	poloha_lcd += speed_step;
	}
	else if (state_machine == 1)
	{
	  var speed_step = getStep(vsc);
	  if (minus == 1)
	  {
	  	speed_step *= -1;
	  }
	  fyzpoloha += speed_step;
	  poloha_lcd += speed_step;
	  if (vacka == 1)
	  {
	  	state_machine =2;
	  	rel_poloha = poloha_lcd;
	  }
	}
	else if (state_machine == 2)
	{
		var speed_step = getStep(vsc);
	  if (minus == 1)
	  {
	  	speed_step *= -1;
	  }
	  fyzpoloha += speed_step;
	  poloha_lcd += speed_step;
	  if (minus == 0 && (poloha_lcd - rel_poloha > shift))
	  {
	  	state_machine =3;
	  	rel_poloha = poloha_lcd;

	  }
	  else if (minus == 1 && (rel_poloha - poloha_lcd  > shift))
	  {
	  	state_machine =3;
	  	rel_poloha = poloha_lcd;
	  }
	}
	//reverse search marker
	else if (state_machine == 3)
	{
		if (smr == 0)
		{
			state_machine = 4;
			rel_poloha = poloha_lcd;
		}
		else
		{
			var step = -getStep(vsm);
			if (minus == 1)
			{
				step *= -1;
			}

			if (vacka == 0)
			{
				state_machine = 4;
				rel_poloha = poloha_lcd
			}

			fyzpoloha += step;
	  		poloha_lcd += step;
		}
	}
	//najet na nulovy bod enkoderu
	else if (state_machine == 4)
	{
		var step = -getStep(vsm);
		if (minus == 1)
		{
			step *= -1;
		}
		if (smr == 1)
		{
			step *= -1;
		}

		fyzpoloha += step;
	  	poloha_lcd += step;

	  	//bulharska konstanta
	  	if (((minus == 0 && smr == 0 || minus == 1 && smr == 1) && rel_poloha - poloha_lcd > 2) ||
	  	((minus == 1 && smr == 0 || minus == 0 && smr == 1)&& poloha_lcd - rel_poloha > 2)
	  	)
	  	{
	  		state_machine = 5;
	  		poloha_lcd = 0;
	  	}
	}
	//mame nulovy bod najety - najet do pozice
	else if (state_machine == 5)
	{
		//velopos, movedist , movecorr
		var step = getStep(velopos);

		var newpos = movedist + movecorr;

		if (poloha_lcd > newpos)
		{
			step *= -1;
		}


		if (Math.abs(poloha_lcd - newpos) < 0.05)
		{
			state_machine = 6;

		}
		fyzpoloha += step;
	  	poloha_lcd += step;

	}
        else if (state_machine == 6)
        {
             poloha_lcd = Number($("#p34100").val());
			clearInterval(intervalID);
			vacka_jo();
                        $("#mybutton").text("Start");
        }


        var states =
        [
         "sjíždění z referenční vačky",
         "hledání referenční vačky",
         "jedeme ještě kousek po referenční vačce - 34092"                ,
         "jedeme z vačky pryč než budeme hledat nulový bod enkodéru 34050",
         "Najíždímje nulový bod enkodéru",
         "máme zrefereváno - přesun do finální pozice - 34080 + 34090",
         "konec, načtena pozice 34100"
        ];



        var speed =
        [
            1,1,1,3,3,6, 0
        ]

        par = pars[speed[state_machine]].num;
        name = pars[speed[state_machine]].num;

        speed = Number($("#p" + par).val());
        $("#automat").text("(" + state_machine + ") " +states[state_machine] + " rychlostí : " + speed*override /100 + "(" + speed  + ")" + " parametr "+  par);

        if (old_state_machine != state_machine && krokovani)
        {
         clearInterval(intervalID);
        }
        old_state_machine = state_machine    ;

	render();



}


function vacka_changed()
{
 delici_poloha = $("#lim_l").val();
 delici_poloha2 = $("#lim_h").val();
 render();

}

function myrow(item,index)
{
var st;
st = ("<tr>");
st += ("<td>");
st +=(item.num);
st +=("</td>");

st +=("<td>");
st +=(item.name);
st +=("</td>");

st +=("<td>");
st +=("<input type = number id = "+ "p"+ item.num +" value =") ;
st +=(item.val);

st +=("> </input>" );
st +=("</td>");

st +=("<td>");
st +=(item.text);
st +=("</td>");
st +=("</tr>");


$("#supertable tr:last").after(st);

}

var pica = 100;
$(document).ready(function(){
	$("input").on('keypress', function(e)
	{
		if (e.which === 13)
		{
			//document.write($(event.target).attr("id"))

		}
	});

        //start machine button
    $("#mybutton").click(function(){

    if ($(this).text() == "Pauznout")
    {
    //pause
      clearInterval(intervalID);
      $(this).text("Pokračovat");
    }
    else if ($(this).text() == "Pokračovat")
    {
     intervalID	 = setInterval(timeout, time_step);
       $(this).text("Pauznout");
    }
    else
    {
      intervalID	 = setInterval(timeout, time_step);
      state_machine = 0;
      $(this).text("Pauznout");
    }
    });

    function reset()
    {
    clearInterval(intervalID);
    fyzpoloha = Number($("#zacatek").val());
    poloha_lcd = 0;
    vacka_jo();
    state_machine = 0;
    $("#mybutton").text("Start");

    render();


    }

    //reset button
    $("#reset").click(reset);

    //krok button
    $("#krok").click(function(){
          intervalID	 = setInterval(timeout, time_step);
    });

    $("#override_slider").on("change mousemove", function()
    {
     var val = $(this).val();
     $("#override_div").text(val);
    });

    $("#krokovat").bind("change", function()
    {
    var dis =      ($(this).prop('checked'));

     $("#krok").prop("disabled", !dis);
     krokovani = dis;

    });



    $("#lim_l").bind("keyup input", vacka_changed);
    $("#lim_h").bind("keyup input", vacka_changed);


    $("#lim_l").val(delici_poloha);
    $("#lim_h").val(delici_poloha2);

   pars.forEach(myrow);


   reset();
   render();
   vacka_jo();
});