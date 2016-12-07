<%@ page language="java" pageEncoding="UTF-8"%>
<%@ page import="java.io.PrintWriter" %>

<logic:present name="BeanActionException"><h4>Stack</h4><pre>
    <%
      Exception e = (Exception) request.getAttribute("BeanActionException");
      e.printStackTrace(new PrintWriter(out));
    %>
</pre></logic:present>