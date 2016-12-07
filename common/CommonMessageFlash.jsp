<%@ page language="java" pageEncoding="UTF-8"%><%@ page import="com.svv.dms.web.Constants,com.gs.db.database.BizAResult" %><%
BizAResult o = (BizAResult)request.getAttribute(Constants.REQUEST_ATTRIBUTE_MESSAGE);
if(o!=null){
  if(o.getResult()){
    out.print(o.getInfo());
  }else{
    out.print("<font color=red>"+o.getInfo()+"</font>");
  }
}%>