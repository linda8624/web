<%@ page language="java" import="java.io.*" pageEncoding="GB2312"%>
<%
  String fileName = request.getParameter("f");
  String fullName = request.getRealPath("/") + fileName;
  
  String filedisplay = java.net.URLEncoder.encode(fileName.substring(fileName.lastIndexOf("/")+1),"UTF-8");
  System.out.println(fullName);
    
  //������Ӧͷ�����ر�����ļ���
  //response.setContentType("application/x-download");
  response.setHeader("Content-Disposition", "attachment; filename=\"" + filedisplay + "\"");

  OutputStream outer = null;   
  FileInputStream in = null;   
  try{
    in = new FileInputStream(fullName);
       
    byte[] b = new byte[1024];   
    int i = 0;
    
    outer = response.getOutputStream();
    while((i = in.read(b)) > 0){   
      outer.write(b, 0, i);   
    }
    outer.flush();   
    //Ҫ���������仰������ᱨ��   
    //java.lang.IllegalStateException: getOutputStream() has already been called for //this response     
    out.clear();   
    out = pageContext.pushBody();   
  }catch(FileNotFoundException e){ 
    out.println("�ļ������ڣ�");
    System.out.println(e.getMessage());   
  }finally{   
    if(in != null){   
      in.close();   
      in = null;   
    }
  }   
%>