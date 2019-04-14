# Create OR Schedules for select surgeons
This creates an sub OR list given a set of attendings
- Step 1: Go to: https://intranet2.mountsinai.org/ms_schedule/Schedule_By_Room_Main.jsp?currentmenucode=menu4&currentsubcode=sub2&ReqDate=04/15/2019
  
  **Replace ReqDate with the date of the surgery**
  
  **You will need to login if you have not**

- Step 2:Launch a debug window Command-Shift-I (mac) or Ctrl-Shift-I (windows)

- Step 3: Enter the following Code

  **Replace the names of the surgeon above (currently "FLORES R" and "ADAMS D")**
  ```javascript
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src = "https://cdn.jsdelivr.net/gh/npcomplete415/random@master/createList.js";
  s.onload = function(){
    createList(["FLORES R", "ADAMS D"])
  };
  $("head").append(s);
  ```
  
