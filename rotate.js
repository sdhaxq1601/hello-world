var x=200,y=600;//y=3x?y=ax+b:p1(100,300),p2(0,0)
var ox=100,oy=300;//original
var ro=70/180*Math.PI;//rotate angel

//(Δx*cosθ- Δy * sinθ+ xB, Δy*cosθ + Δx * sinθ+ yB )
console.log((Math.abs(x-ox))*Math.cos(ro)-(Math.abs(y-oy))*Math.sin(ro)+ox,(Math.abs(y-oy))*Math.cos(ro)+(Math.abs(x-ox))*Math.sin(ro)+oy)