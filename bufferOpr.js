/**
 * 
 * @param {*} buf 
 * @param {*} asc 
 * return a1 [file{name,binary},...]
 */
exports.find=function(buf,asc=[0x0d,0x0a]){
    //console.log(buf,asc);
    var files={};
    var start,end,name,filename,delims;
    let a1=[];
    var i1=buf.findIndex((i,j,k)=>{
        if(i==parseInt('0d',16)){
            return k[j+1]==parseInt('0a',16)
        }else{
            return false
        }
    });
    delims=buf.slice(0,i1)
    const DL=delims.length
    let _buf=buf
    let p=0,p1,p2
    //console.log('数量',getCounts(_buf,delims))
    for(let i=0,t,l=getCounts(_buf,delims)-1;i<l;i++){
        let f={}
        p1=p+DL+2
        p2=position(_buf,delims,p1)
        p=p2
        //a1.push(_buf.slice(p1,p2))
        t=_buf.slice(p1,p2-2)
        //console.log(t.slice(0,180))
        console.log(t.slice(0,180).toString())
        p1=position(t,Buffer.from(' name="'))+' name="'.length
        p2=position(t,Buffer.from('"'),p1)
        //console.log(p1,p2)
        f.name=t.slice(p1,p2).toString()
        p1=position(t,Buffer.from('filename="'))+'filename="'.length
        p2=position(t,Buffer.from('"'),p1)
        //console.log(p1,p2)
        f.filename=t.slice(p1,p2).toString()
        p1=position(t,Buffer.from('Content-Type: '))+'Content-Type: '.length
        p2=position(t,[0x0d,0x0a],p1)
        //console.log(p1,p2)
        f.type=t.slice(p1,p2).toString()
        console.log(f.type)
        p1=position(t,[0x0d,0x0a,0x0d,0x0a],p1)+4
        //p2>end
        f.binary=t.slice(p1)
        a1.push(f)
    }
    //console.log(a1[0].binary,a1[0].binary.toString())
    
    return a1
};

function position(buf,search,start=0){
    return buf.slice(start).findIndex((i,j,k)=>{
        for(let _i=0,l=search.length;_i<l;_i++){
            if(k[j+_i]!=search[_i])return false
        }
        return true
    })+start;
}

/**
 * 
 * @param {Buffer} buf 
 * @param {Buffer} ar
 * @returns number
 */
function getCounts(buf,ar){
    //console.log(buf,ar)
    return buf.reduce((r,i,j,k)=>{
        /* if(i==parseInt('0d',16) && k[j+1]==parseInt('0a',16)){
            return ++r
        }else return r */
        for(let _i=0,l=ar.length;_i<l;_i++){
            if(k[j+_i]!=ar[_i])return r
        }
        return ++r
    },0)
};
exports.files=(buf)=>{
    let delims;
    let name,filename;
    let f={};
    let str=buf.toString();
    let t=exports.find(buf);
    delims=str.substring(0,t);
    console.log(delims);
};