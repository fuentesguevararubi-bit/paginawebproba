function generarAleatorios(){

    let array=[];
    for(let i=0;i<25;i++){
        array.push(Math.floor(Math.random()*100)+1);
    }

    document.getElementById("datos").value=array.join(", ");

    calcular();
    generarTalloHoja();
     actualizarConceptos(datos);
}

function calcular(){

    let datos=document.getElementById("datos").value
        .split(/[\s,]+/)
        .map(Number)
        .filter(n=>!isNaN(n));

    if(datos.length<20){
        alert("Debes ingresar mínimo 20 datos.");
        return;
    }

    datos.sort((a,b)=>a-b);

    let n=datos.length;
        document.getElementById("total").innerHTML = "Total (n): " + n;
    let suma=datos.reduce((a,b)=>a+b,0);
    let media=(suma/n).toFixed(2);

    let mediana = n%2===0 ?
    ((datos[n/2-1]+datos[n/2])/2).toFixed(2) :
    datos[Math.floor(n/2)];

    // Calcular moda
let frecuencia = {};
let maxFrecuencia = 0;
let moda = [];

datos.forEach(num => {
    frecuencia[num] = (frecuencia[num] || 0) + 1;

    if (frecuencia[num] > maxFrecuencia) {
        maxFrecuencia = frecuencia[num];
    }
});

// Puede haber más de una moda
for (let valor in frecuencia) {
    if (frecuencia[valor] === maxFrecuencia && maxFrecuencia > 1) {
        moda.push(Number(valor));
    }
}

if (moda.length === 0) {
    moda = "No hay moda";
} else {
    moda = moda.join(", ");
}

    let minimo=datos[0];
    let maximo=datos[n-1];
    let rango=maximo-minimo;

    document.getElementById("media").innerHTML="Media: "+media;
    document.getElementById("mediana").innerHTML="Mediana: "+mediana;
    document.getElementById("moda").innerHTML="Moda: "+moda;
    document.getElementById("minimo").innerHTML="Mínimo: "+minimo;
    document.getElementById("maximo").innerHTML="Máximo: "+maximo;
    document.getElementById("rango").innerHTML="Rango: "+rango;


    let amplitud=parseFloat(document.getElementById("amplitud").value);

    generarHistograma("hist1",datos,amplitud);
    generarPoligono("hist2",datos,amplitud);
    generarOjiva("hist3",datos,amplitud);
    generarPareto("hist4",datos);
    generarTablaFrecuencias();
    generarTalloHoja();
    actualizarConceptos(datos);
}

/* =========================
   BASE CLASES
========================= */
function obtenerClases(datos,amplitud){

    const min=Math.min(...datos);
    const max=Math.max(...datos);
    const rango=max-min;
    const clases=Math.ceil(rango/amplitud);

    let frecuencias=new Array(clases).fill(0);

    datos.forEach(num=>{
        let index=Math.floor((num-min)/amplitud);
        if(index===clases) index--;
        frecuencias[index]++;
    });

    return {frecuencias,clases,min,max};
}

/* =========================
   DIBUJAR EJES + CUADRÍCULA
========================= */
function dibujarEjes(ctx,canvas,maxY,labelsX,ejeDerecho=false){

    const margen=60;
    const ancho=canvas.width-margen*2;
    const alto=canvas.height-margen*2;

    ctx.strokeStyle="#6A1FB5";
    ctx.lineWidth=1.5;

    // Eje Y
    ctx.beginPath();
    ctx.moveTo(margen,margen);
    ctx.lineTo(margen,canvas.height-margen);
    ctx.stroke();

    // Eje X
    ctx.beginPath();
    ctx.moveTo(margen,canvas.height-margen);
    ctx.lineTo(canvas.width-margen,canvas.height-margen);
    ctx.stroke();

    // Cuadrícula horizontal
    ctx.font="12px Segoe UI";
    ctx.fillStyle="#6A1FB5";
    ctx.textAlign="right";

    let divisiones=5;

    for(let i=0;i<=divisiones;i++){

        let y=canvas.height-margen-(alto/divisiones)*i;

        ctx.strokeStyle="#312e81";
        ctx.beginPath();
        ctx.moveTo(margen,y);
        ctx.lineTo(canvas.width-margen,y);
        ctx.stroke();

        let valor=Math.round((maxY/divisiones)*i);
        ctx.fillText(valor,margen-10,y+4);
    }

    // Etiquetas X
    let pasoX=ancho/labelsX.length;

    labelsX.forEach((txt,i)=>{
        let x=margen+pasoX*i+pasoX/2;
        let y=canvas.height-margen+30;
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(-Math.PI/6); // rotación 30°
        ctx.fillText(txt,0,0);
        ctx.restore();
    });

    return {margen,ancho,alto};
}

/* =========================
   HISTOGRAMA
========================= */
function generarHistograma(id,datos,amplitud){

    const canvas=document.getElementById(id);
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;
    canvas.height=300;

    const {frecuencias,clases,min}=obtenerClases(datos,amplitud);

    let labels=[];
    for(let i=0;i<clases;i++){
        let inicio=min+i*amplitud;
        let fin=inicio+amplitud;
        labels.push(`${inicio}-${fin}`);
    }

    const maxF=Math.max(...frecuencias);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const {margen,ancho,alto}=dibujarEjes(ctx,canvas,maxF,labels);

    let paso=ancho/clases;

    for(let i=0;i<clases;i++){

        let altura=(frecuencias[i]/maxF)*alto;
        let x=margen+i*paso;
        let y=canvas.height-margen-altura;

        // Barra
        ctx.fillStyle="#c084fc";
        ctx.fillRect(x+5,y,paso-10,altura);

        // Número arriba de la barra (CORREGIDO)
        ctx.fillStyle="#6A1FB5";
        ctx.font="bold 13px Segoe UI";
        ctx.textAlign="center";
        ctx.fillText(frecuencias[i],x+paso/2,y-8);
    }
}

/* =========================
   POLÍGONO
========================= */
function generarPoligono(id,datos,amplitud){

    const canvas=document.getElementById(id);
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;
    canvas.height=300;

    const {frecuencias,clases,min}=obtenerClases(datos,amplitud);

    let labels=[];
    for(let i=0;i<clases;i++){
        let inicio=min+i*amplitud;
        let fin=inicio+amplitud;
        labels.push(`${inicio}-${fin}`);
    }

    const maxF=Math.max(...frecuencias);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const {margen,ancho,alto}=dibujarEjes(ctx,canvas,maxF,labels);

    let paso=ancho/clases;

    // 🔥 Crear gradiente tipo Chart.js
    let gradiente=ctx.createLinearGradient(0,margen,0,canvas.height-margen);
    gradiente.addColorStop(0,"rgba(168,85,247,0.35)");
    gradiente.addColorStop(1,"rgba(168,85,247,0.05)");

    let puntos=[];

    for(let i=0;i<clases;i++){
        let x=margen+i*paso+paso/2;
        let y=canvas.height-margen-(frecuencias[i]/maxF)*alto;
        puntos.push({x,y});
    }

    // 🔥 Dibujar curva suavizada (simula tension:0.3)
    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.strokeStyle="#a855f7";

    ctx.moveTo(puntos[0].x,puntos[0].y);

    for(let i=1;i<puntos.length-1;i++){
        let xc=(puntos[i].x+puntos[i+1].x)/2;
        let yc=(puntos[i].y+puntos[i+1].y)/2;
        ctx.quadraticCurveTo(puntos[i].x,puntos[i].y,xc,yc);
    }

    ctx.quadraticCurveTo(
        puntos[puntos.length-1].x,
        puntos[puntos.length-1].y,
        puntos[puntos.length-1].x,
        puntos[puntos.length-1].y
    );

    // 🔥 Cerrar figura para rellenar
    ctx.lineTo(puntos[puntos.length-1].x, canvas.height-margen);
    ctx.lineTo(puntos[0].x, canvas.height-margen);
    ctx.closePath();

    ctx.fillStyle=gradiente;
    ctx.fill();
    ctx.stroke();

    // 🔥 Puntos encima
    puntos.forEach(p=>{
        ctx.beginPath();
        ctx.fillStyle="#d946ef";
        ctx.arc(p.x,p.y,4,0,Math.PI*2);
        ctx.fill();
    });
}

//OJIVA//
function generarOjiva(id,datos,amplitud){

    const canvas=document.getElementById(id);
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;
    canvas.height=300;

    let {frecuencias,clases,min}=obtenerClases(datos,amplitud);

    // Frecuencia acumulada
    for(let i=1;i<frecuencias.length;i++){
        frecuencias[i]+=frecuencias[i-1];
    }

    let labels=[];
    for(let i=0;i<clases;i++){
        labels.push(min+(i+1)*amplitud);
    }

    const maxF=Math.max(...frecuencias);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const {margen,ancho,alto}=dibujarEjes(ctx,canvas,maxF,labels);

    let paso=ancho/clases;

    // 🔥 Crear gradiente
    let gradiente=ctx.createLinearGradient(0,margen,0,canvas.height-margen);
    gradiente.addColorStop(0,"rgba(244,114,182,0.4)");
    gradiente.addColorStop(1,"rgba(244,114,182,0.05)");

    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.strokeStyle="#f472b6";

    let puntos=[];

    for(let i=0;i<clases;i++){

        let x=margen+i*paso+paso/2;
        let y=canvas.height-margen-(frecuencias[i]/maxF)*alto;

        puntos.push({x,y});

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    }

    // 🔥 Cerrar figura para rellenar
    ctx.lineTo(puntos[puntos.length-1].x, canvas.height-margen);
    ctx.lineTo(puntos[0].x, canvas.height-margen);
    ctx.closePath();

    ctx.fillStyle=gradiente;
    ctx.fill();
    ctx.stroke();

    // 🔥 Dibujar puntos encima
    puntos.forEach(p=>{
        ctx.beginPath();
        ctx.fillStyle="#f0abfc";
        ctx.arc(p.x,p.y,4,0,Math.PI*2);
        ctx.fill();
    });
}

/* =========================
   PARETO CON EJE DERECHO %
========================= */
function generarPareto(id,datos){

    const canvas=document.getElementById(id);
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth;
    canvas.height=300;

    let frec={};
    datos.forEach(x=>frec[x]=(frec[x]||0)+1);

    let ordenado=Object.entries(frec)
        .sort((a,b)=>b[1]-a[1]);

    let labels=ordenado.map(x=>x[0]);
    let fi=ordenado.map(x=>x[1]);

    let acumulada=[];
    let suma=0;

    fi.forEach(f=>{
        suma+=f;
        acumulada.push(suma);
    });

    const maxF=Math.max(...fi);

    ctx.clearRect(0,0,canvas.width,canvas.height);

    const {margen,ancho,alto}=dibujarEjes(ctx,canvas,maxF,labels);

    let paso=ancho/labels.length;

    // Barras
    for(let i=0;i<fi.length;i++){

        let altura=(fi[i]/maxF)*alto;
        let x=margen+i*paso;
        let y=canvas.height-margen-altura;

        ctx.fillStyle="#a855f7";
        ctx.fillRect(x+5,y,paso-10,altura);
    }

    // Línea %
    ctx.beginPath();
    ctx.strokeStyle="#facc15";
    ctx.lineWidth=2;

    for(let i=0;i<acumulada.length;i++){

        let x=margen+i*paso+paso/2;
        let y=canvas.height-margen-(acumulada[i]/suma)*alto;

        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);

        ctx.fillStyle="#fde047";
        ctx.beginPath();
        ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fill();
    }

    ctx.stroke();
}

/* =========================
   FUNCIONES MATEMÁTICAS
========================= */

function factorial(n){
    if(n<0) return null;
    let res=1;
    for(let i=2;i<=n;i++) res*=i;
    return res;
}

function calcularFactorial(){
    let n=parseInt(document.getElementById("factorialN").value);
    let r=factorial(n);
    document.getElementById("resultadoFactorial").innerHTML =
        r!==null ? `Resultado: ${r}` : "Valor inválido";
}

function calcularPermutacion(){
    let n=parseInt(document.getElementById("permN").value);
    let r=parseInt(document.getElementById("permR").value);

    if(r>n){
        document.getElementById("resultadoPermutacion").innerHTML="r no puede ser mayor que n";
        return;
    }

    let resultado=factorial(n)/factorial(n-r);

    document.getElementById("resultadoPermutacion").innerHTML =
        `P(${n},${r}) = ${resultado}`;
}

function calcularCombinacion(){
    let n=parseInt(document.getElementById("combN").value);
    let r=parseInt(document.getElementById("combR").value);

    if(r>n){
        document.getElementById("resultadoCombinacion").innerHTML="r no puede ser mayor que n";
        return;
    }

    let resultado=factorial(n)/(factorial(r)*factorial(n-r));

    document.getElementById("resultadoCombinacion").innerHTML =
        `C(${n},${r}) = ${resultado}`;
}


/* =========================
   REGLA MULTIPLICATIVA
========================= */

function calcularReglaMultiplicativa(){

    let pA=parseFloat(document.getElementById("probA").value);
    let pB=parseFloat(document.getElementById("probB").value);

    if(isNaN(pA)||isNaN(pB)){
        document.getElementById("resultadoMultiplicativo").innerHTML="Valores inválidos";
        return;
    }

    let resultado=(pA*pB).toFixed(4);

    document.getElementById("resultadoMultiplicativo").innerHTML =
        `P(A ∩ B) = ${resultado}`;

    dibujarArbol(pA,pB);
}

function dibujarArbol(pA,pB){

    const canvas=document.getElementById("arbolMultiplicativo");
    const ctx=canvas.getContext("2d");

    canvas.width=canvas.offsetWidth;
    canvas.height=260;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#6A1FB5";
    ctx.lineWidth=2;
    ctx.fillStyle="#6A1FB5";
    ctx.font="14px Segoe UI";

    let centroX=canvas.width/2;
    let inicioY=40;

    // Nodo A
    ctx.beginPath();
    ctx.arc(centroX,inicioY,18,0,Math.PI*2);
    ctx.stroke();
    ctx.fillText("A",centroX-5,inicioY+5);

    // Rama izquierda
    ctx.beginPath();
    ctx.moveTo(centroX,inicioY+18);
    ctx.lineTo(centroX-100,160);
    ctx.stroke();

    ctx.fillText(`B (${pB})`,centroX-130,180);

    // Rama derecha
    ctx.beginPath();
    ctx.moveTo(centroX,inicioY+18);
    ctx.lineTo(centroX+100,160);
    ctx.stroke();

    ctx.fillText(`¬B (${(1-pB).toFixed(2)})`,centroX+70,180);
}
/* =========================
   CONJUNTOS
========================= */

function parseSet(text){
    return [...new Set(
        text.split(',')
            .map(x => Number(x.trim()))
            .filter(x => !isNaN(x))
    )];
}

function calcularConjuntos(){

    const A = parseSet(document.getElementById("setA").value);
    const B = parseSet(document.getElementById("setB").value);

    const union = [...new Set([...A, ...B])].sort((a,b)=>a-b);
    const inter = A.filter(x => B.includes(x));
    const AminusB = A.filter(x => !B.includes(x));
    const BminusA = B.filter(x => !A.includes(x));

    document.getElementById("resultadoConjuntos").innerHTML = `
        <strong>A ∪ B:</strong> { ${union.join(", ")} } <br>
        <strong>A ∩ B:</strong> { ${inter.join(", ")} } <br>
        <strong>A − B:</strong> { ${AminusB.join(", ")} } <br>
        <strong>B − A:</strong> { ${BminusA.join(", ")} }
    `;

    actualizarEspacio(union);
}

/* Botones */
document.getElementById("btnConjuntos")
    ?.addEventListener("click", calcularConjuntos);

document.getElementById("btnRandomSets")
    ?.addEventListener("click", generarSetsAleatorios);

function generarSetsAleatorios(){

    let A=[],B=[];
    for(let i=0;i<6;i++) A.push(Math.floor(Math.random()*50)+1);
    for(let i=0;i<6;i++) B.push(Math.floor(Math.random()*50)+1);

    document.getElementById("setA").value=A.join(",");
    document.getElementById("setB").value=B.join(",");

    calcularConjuntos();
}


/* =========================
   EXPERIMENTO Y EVENTO
========================= */

let espacioMuestralGlobal=[];

function actualizarEspacio(arr){
    espacioMuestralGlobal = arr;
    document.getElementById("espacioMuestral").innerText =
        "{ " + arr.join(", ") + " }";
}

function calcularEvento(){

    if(espacioMuestralGlobal.length===0){
        alert("Primero calcula los conjuntos.");
        return;
    }

    const cond=document.getElementById("condicion").value;
    const k=parseFloat(document.getElementById("valorK").value);

    if(isNaN(k)) return;

    let favorables=espacioMuestralGlobal.filter(x=>{
        if(cond===">=") return x>=k;
        if(cond==="<=") return x<=k;
        if(cond===">") return x>k;
        if(cond==="<") return x<k;
    });

    const prob = favorables.length / espacioMuestralGlobal.length;

    document.getElementById("resultadoEvento").innerHTML = `
        <strong>Evento:</strong> { ${favorables.join(", ")} } <br>
        <strong>P(E):</strong> ${favorables.length} / ${espacioMuestralGlobal.length}
        = ${prob.toFixed(3)}
    `;
}

document.getElementById("btnEvento")
    ?.addEventListener("click", calcularEvento);

document.getElementById("btnRandomSample")
    ?.addEventListener("click", ()=>{
        document.getElementById("valorK").value =
            Math.floor(Math.random()*50)+1;
        calcularEvento();
    });

/* =========================
   EJEMPLO AUTOMÁTICO
========================= */

window.addEventListener("load", ()=>{
    if(document.getElementById("setA") && document.getElementById("setB")){
        calcularConjuntos();
    }
});
/*====================================
    REGLA MULTIPLICATIVA Y DIAGRAMA DE ARBOL
======================================*/
function calcularMultiplicativa(){

    let nombre1 = document.getElementById("paso1Nombre").value;
    let nombre2 = document.getElementById("paso2Nombre").value;
    let nombre3 = document.getElementById("paso3Nombre").value;

    let opciones1 = document.getElementById("paso1Opciones").value
        .split(",").map(x=>x.trim()).filter(x=>x);

    let opciones2 = document.getElementById("paso2Opciones").value
        .split(",").map(x=>x.trim()).filter(x=>x);

    let opciones3 = document.getElementById("paso3Opciones").value
        .split(",").map(x=>x.trim()).filter(x=>x);

    if(opciones1.length === 0 || opciones2.length === 0){
        document.getElementById("resultadoMultiplicativa").innerText =
            "Debes ingresar al menos Paso 1 y Paso 2.";
        return;
    }

    // =============================
    // TOTAL REGLA MULTIPLICATIVA
    // =============================

    let total = opciones1.length * opciones2.length;
    if(opciones3.length > 0){
        total *= opciones3.length;
    }

    let texto = "1) Etapas:\n";
    texto += "- " + nombre1 + "\n";
    texto += "- " + nombre2 + "\n";
    if(opciones3.length>0) texto += "- " + nombre3 + "\n";

    texto += "\n2) Conteo de opciones:\n";
    texto += nombre1 + ": " + opciones1.length + "\n";
    texto += nombre2 + ": " + opciones2.length + "\n";
    if(opciones3.length>0) texto += nombre3 + ": " + opciones3.length + "\n";

    texto += "\n3) Regla multiplicativa:\n";
    texto += "Total = " + total + "\n\n";

    // =============================
    // ÁRBOL PROFESIONAL
    // =============================

    texto += "Diagrama de árbol (decisiones paso a paso):\n";
    texto += "Inicio\n";

    opciones1.forEach((op1, i1) => {

        let esUltimo1 = i1 === opciones1.length - 1;
        texto += (esUltimo1 ? "└─ " : "├─ ") + op1 + "\n";

        opciones2.forEach((op2, i2) => {

            let prefijo2 = esUltimo1 ? "   " : "│  ";
            let esUltimo2 = i2 === opciones2.length - 1;

            texto += prefijo2 + (esUltimo2 ? "└─ " : "├─ ") + op2 + "\n";

            if(opciones3.length > 0){

                opciones3.forEach((op3, i3) => {

                    let prefijo3 = prefijo2 + (esUltimo2 ? "   " : "│  ");
                    let esUltimo3 = i3 === opciones3.length - 1;

                    texto += prefijo3 + (esUltimo3 ? "└─ " : "├─ ") + op3 + "\n";

                });

            }

        });

    });

    document.getElementById("resultadoMultiplicativa").innerText = texto;
}

/* =========================
   DIAGRAMA DE TALLO Y HOJA
========================= */

function generarTalloHoja(){

    let datos = document.getElementById("datos").value
        .split(/[\s,]+/)
        .map(Number)
        .filter(n => !isNaN(n));

    if(datos.length < 1){
        alert("Primero ingresa datos.");
        return;
    }

    datos.sort((a,b)=>a-b);

    let tallos = {};

    datos.forEach(num => {

        let tallo = Math.floor(num / 10);   // parte izquierda
        let hoja = num % 10;                // última cifra

        if(!tallos[tallo]){
            tallos[tallo] = [];
        }

        tallos[tallo].push(hoja);
    });

    let resultado = "Tallo | Hojas\n";
    resultado += "\nClave: 1 | 2 = 12\n";

    Object.keys(tallos)
    .sort((a,b)=>a-b)
    .forEach((tallo, index) => {

        tallos[tallo].sort((a,b)=>a-b);

        // Enumeración con 2 dígitos
        let numero = String(index + 1).padStart(2, "0");

        resultado += numero + " | " + tallos[tallo].join(" ") + "\n";
    });

    document.getElementById("resultadoTalloHoja").innerText = resultado;
}

/* =========================
   TABLA DE FRECUENCIAS
========================= */

function generarTablaFrecuencias(){

    let datos = document.getElementById("datos").value
        .split(/[\s,]+/)
        .map(Number)
        .filter(n => !isNaN(n));

    if(datos.length < 1){
        alert("Ingresa datos primero.");
        return;
    }

    datos.sort((a,b)=>a-b);

    let n = datos.length;
    let amplitud = parseFloat(document.getElementById("amplitud").value);

    const min = Math.min(...datos);
    const max = Math.max(...datos);
    const rango = max - min;
    const clases = Math.ceil(rango / amplitud);

    let fi = new Array(clases).fill(0);

    // Calcular frecuencias absolutas
    datos.forEach(num => {
        let index = Math.floor((num - min) / amplitud);
        if(index === clases) index--;
        fi[index]++;
    });

    let tbody = document.querySelector("#tablaFrecuencias tbody");
    tbody.innerHTML = "";

    let Fi = 0;
    let Fr = 0;

    for(let i=0; i<clases; i++){

        let limiteInferior = min + i * amplitud;
        let limiteSuperior = limiteInferior + amplitud;

        let puntoMedio = (limiteInferior + limiteSuperior) / 2;

        Fi += fi[i];

        let fr = fi[i] / n;
        Fr += fr;

        let fila = `
            <tr>
                <td>[${limiteInferior} - ${limiteSuperior})</td>
                <td>${puntoMedio.toFixed(2)}</td>
                <td>${fi[i]}</td>
                <td>${Fi}</td>
                <td>${fr.toFixed(3)}</td>
                <td>${Fr.toFixed(3)}</td>
            </tr>
        `;

        tbody.innerHTML += fila;
    }
}
function actualizarConceptos(datos) {

    if (!datos || datos.length === 0) return;

    let min = Math.min(...datos);
    let max = Math.max(...datos);
    let n = datos.length;

    document.getElementById("muestraSize").innerText = n;
    document.getElementById("muestraSize2").innerText = n;
    document.getElementById("datoMin").innerText = min;
    document.getElementById("datoMax").innerText = max;

    // Si tú algún día defines población total, puedes cambiar esto
    document.getElementById("tipoEstudio").innerText = "Muestreo";
}

const goTopBtn = document.getElementById("goTopBtn");

// Mostrar cuando baja 200px
window.addEventListener("scroll", () => {
    if (window.scrollY > 200) {
        goTopBtn.style.display = "block";
    } else {
        goTopBtn.style.display = "none";
    }
});

// Scroll suave
goTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
