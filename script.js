var a_id=["hour10","hour1","min10","min1","sec10","sec1"];
var v_timeOld="";
f_timeSet();
function f_timeSet(){
  var d_d=new Date();
  var v_hour=f_zeroPadding(d_d.getHours());
  var v_min=f_zeroPadding(d_d.getMinutes());
  var v_sec=f_zeroPadding(d_d.getSeconds());
  var v_time=""+v_hour+v_min+v_sec;
  for(var v_i=0; v_i<v_time.length; v_i++){
    if(v_time[v_i]!=v_timeOld[v_i]){
      f_moveTime(a_id[v_i],v_time[v_i],0);
    }
  }
  v_timeOld=v_time;
  setTimeout(f_timeSet, 200);
}
function f_moveTime(v_id,v_no,v_y){
  document.getElementById(v_id).style.backgroundPosition=-(v_no*60)+"px -"+v_y+"px";
  if(v_y<300){
    v_y+=100;
    setTimeout(function(){
        f_moveTime(v_id,v_no,v_y);
    },150);
  }
}
function f_zeroPadding(v_n){
  if(v_n<10){
    v_n="0"+v_n;
  }
  return v_n;
}