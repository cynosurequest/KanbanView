public class EmployeeTimesheet {
    private Integer numMonths;
    
    
    @AuraEnabled
    public static list<Timesheet__c> getTimeSheetRecords(string month) {
        ID currentUserId = UserInfo.getUserId();
        
        list<Timesheet__c> tsList = [SELECT Id, Name, Monthly_Timesheet__r.Month__c, Start_Time__c, Morning_Break_Start__c, Morning_Break_End__c, Lunch_Start__c, Lunch_End__c,Evening_Break_Start__c,Evening_Break_End__c, End_Time__c, Overtime_Hours__c, Total_Work_Hours__c, Date__c FROM  Timesheet__c WHERE Monthly_Timesheet__r.Month__c = :month AND User__c = :currentUserId ORDER by date__c asc ];
        
        return tsList; 
        
    }
    
    @AuraEnabled
    public static boolean getLeaveRequestRecord(string currentDate){
        ID currentUserId = UserInfo.getUserId();
        date timeSheetDate = date.parse(currentDate);
        //system.debug('timeSheetDate' + timeSheetDate);
        list<Leave_Request__c> lrList = [SELECT Id, Start_Date__c, End_Date__c, No_of_leave_Days__c,Start_Time__c,End_Time__c, Name FROM Leave_Request__c WHERE Contact__r.User__c = :currentUserId  AND Status__c = 'Approved'];
        
        
        for(Leave_Request__c l : lrList ){
            list<date> leaveDates = new list<date>();
            date val1 = l.Start_Date__c.date();
            date val2 = l.End_Date__c.date();
            for(date d = val1; d<=val2 ; d = d.addDays(1)){
                leaveDates.add(d);
            }
            if(leaveDates.contains(timeSheetDate)){
                
                
                return true;
            }
            
            
        }
        return false;
        
    }
    
    @AuraEnabled
    public static void insertTimeSheet(string activeMonth, string currentDate,string startTime,String morningBreakStart,String morningBreakEnd,string lunchStart,string lunchEnd, string eveningBreakStart,string eveningBreakEnd, string endTime, integer overTimeHours) {
        system.debug('startTime : ' + startTime);
        system.debug('currentDate' + currentDate);
        date currentYear = date.parse(currentDate);
        ID currentUserId = UserInfo.getUserId();
        Id monthlyTimesheetId;
        list<Monthly_Timesheet__c> mtList = [SELECT Id, User__c, Year__c, Month__c FROM Monthly_Timesheet__c WHERE User__c = :currentUserId AND Month__c = :activeMonth AND Year__c = :currentYear.year() ];  
        Monthly_Timesheet__c mt = new Monthly_Timesheet__c();
        if(mtList.size() == 0){
            mt.Year__c = currentYear.year();
            mt.User__c = UserInfo.getUserId();
            mt.Month__c = activeMonth;
            insert mt;
            monthlyTimesheetId = mt.Id;
        } else {
            monthlyTimesheetId = mtList.get(0).id;    
        }
        
        
        
        system.debug('hi');
        date presentDate = date.parse(currentDate);
        list<Timesheet__c> tsList = [SELECT Id, Name, Monthly_Timesheet__r.Month__c, Start_Time__c, Morning_Break_Start__c, Morning_Break_End__c,Lunch_Start__c, Lunch_End__c, Evening_Break_Start__c,Evening_Break_End__c, End_Time__c, Overtime_Hours__c, Total_Work_Hours__c, Date__c FROM  Timesheet__c WHERE User__c = :currentUserId AND Date__c = :presentDate ORDER by date__c asc ];
        
        system.debug('tsList ' + tsList);
        system.debug('size ' + tsList.size());
        if(tsList.size() == 0) {
            list<string> startTimeList = startTime.split(':');
            time startTimeVar = time.newInstance(integer.valueOf(startTimeList[0]),
                                                 integer.valueOf(startTimeList[1]), 
                                                 0, 0);
            
            system.debug('startTimeVar : ' + startTimeVar);
            
            list<string> MBreakSList = morningBreakStart.split(':');
            time morningBreakStartVar = time.newInstance(integer.valueOf(MBreakSList[0]),
                                                 integer.valueOf(MBreakSList[1]), 
                                                 0, 0);
            
            system.debug('MBreakSVar : ' + MBreakSList);

            list<string> MBreakEList = morningBreakEnd.split(':');
            time morningBreakEndVar = time.newInstance(integer.valueOf(MBreakEList[0]),
                                                 integer.valueOf(MBreakEList[1]), 
                                                 0, 0);
            
            system.debug('MBreakEVar : ' + MBreakEList);
            
            list<string> lunchStartList = lunchStart.split(':');
            time lunchStartVar = time.newInstance(integer.valueOf(lunchStartList[0]),
                                                  integer.valueOf(lunchStartList[1]), 
                                                  0, 0);
            
            list<string> lunchEndList = lunchEnd.split(':');
            time lunchEndVar = time.newInstance(integer.valueOf(lunchEndList[0]),
                                                integer.valueOf(lunchEndList[1]), 
                                                0, 0);

            list<string> EBreakSList = eveningBreakStart.split(':');
            time eveningBreakStartVar = time.newInstance(integer.valueOf(EBreakSList[0]),
                                                 integer.valueOf(EBreakSList[1]), 
                                                 0, 0);

            list<string> EBreakEList = eveningBreakEnd.split(':');
            time eveningBreakEndVar = time.newInstance(integer.valueOf(EBreakEList[0]),
                                                 integer.valueOf(EBreakEList[1]), 
                                                 0, 0);                                   
                                                
            list<string> endTimeList = endTime.split(':');
            time endTimeVar = time.newInstance(integer.valueOf(endTimeList[0]),
                                               integer.valueOf(endTimeList[1]), 
                                               0, 0);
            Timesheet__c ts = new Timesheet__c();
            ts.Date__c = date.parse(currentDate);
            ts.Start_Time__c = startTimeVar;
            ts.Morning_Break_Start__c = morningBreakStartVar;
            ts.Morning_Break_End__c = morningBreakEndVar;
            ts.Lunch_Start__c = lunchStartVar;
            ts.Lunch_End__c = lunchEndVar;
            ts.Evening_Break_Start__c = eveningBreakStartVar;
            ts.Evening_Break_End__c = eveningBreakEndVar;
            ts.End_Time__c = endTimeVar;
            if(overTimeHours != null ){
                ts.Overtime_Hours__c = overTimeHours;} else{
                    ts.Overtime_Hours__c = 0;
                }
            ts.User__c = UserInfo.getUserId();
            ts.Monthly_Timesheet__c = mt.id;
            ts.Monthly_Timesheet__c = monthlyTimesheetId;
            insert ts;
        } else {
            	time startTimeVar;
                time morningBreakStartVar;
                time morningBreakEndVar;
            	time lunchStartVar;
                time lunchEndVar;
                time eveningBreakStartVar;
                time eveningBreakEndVar;
                time endTimeVar;
            
            	if(startTime != NULL){
                list<string> startTimeList = startTime.split(':');
               	 startTimeVar = time.newInstance(integer.valueOf(startTimeList[0]),
                                                     integer.valueOf(startTimeList[1]), 
                                                     0, 0);
                }
                
                if(morningBreakStart != NULL){
                    list<string> MBreakSList = morningBreakStart.split(':');
                    morningBreakStartVar = time.newInstance(integer.valueOf(MBreakSList[0]),
                                                          integer.valueOf(MBreakSList[1]), 
                                                          0, 0);
                }

                if(morningBreakEnd != NULL){
                    list<string> MBreakEList = morningBreakEnd.split(':');
                    morningBreakEndVar = time.newInstance(integer.valueOf(MBreakEList[0]),
                                                          integer.valueOf(MBreakEList[1]), 
                                                          0, 0);
                }
            
            if(lunchStart != NULL){
                list<string> lunchStartList = lunchStart.split(':');
                 lunchStartVar = time.newInstance(integer.valueOf(lunchStartList[0]),
                                                      integer.valueOf(lunchStartList[1]), 
                                                      0, 0);
            }
            
            if(lunchEnd != NULL){
                list<string> lunchEndList = lunchEnd.split(':');
                 lunchEndVar = time.newInstance(integer.valueOf(lunchEndList[0]),
                                                    integer.valueOf(lunchEndList[1]), 
                                                    0, 0);
            if(eveningBreakStart != NULL){
                    list<string> EBreakSList= eveningBreakStart.split(':');
                    eveningBreakStartVar = time.newInstance(integer.valueOf(EBreakSList[0]),
                                                          integer.valueOf(EBreakSList[1]), 
                                                          0, 0);
            }   
            
            if(eveningBreakEnd != NULL){
                list<string> EBreakEList= eveningBreakEnd.split(':');
                eveningBreakEndVar = time.newInstance(integer.valueOf(EBreakEList[0]),
                                                      integer.valueOf(EBreakEList[1]), 
                                                      0, 0);
            }  
            
            }
            if(endTime != NULL){
                list<string> endTimeList = endTime.split(':');
                 endTimeVar = time.newInstance(integer.valueOf(endTimeList[0]),
                                                   integer.valueOf(endTimeList[1]), 
                                                   0, 0);
            }
            tsList[0].Date__c = date.parse(currentDate);
            tsList[0].Start_Time__c = (startTimeVar != null) ? startTimeVar : tsList[0].Start_Time__c ;
            tsList[0].Morning_Break_Start__c = (morningBreakStartVar != null) ? morningBreakStartVar : tsList[0].Morning_Break_Start__c;
            tsList[0].Morning_Break_End__c=(morningBreakEndVar != null) ? morningBreakEndVar : tsList[0].Morning_Break_End__c;
            tsList[0].Lunch_Start__c = (lunchStartVar != null) ?lunchStartVar : tsList[0].Lunch_Start__c ;
            tsList[0].Lunch_End__c = (lunchEndVar != null) ? lunchEndVar : tsList[0].Lunch_End__c ;
            tsList[0].Evening_Break_Start__c = (eveningBreakStartVar != null) ? eveningBreakStartVar : tsList[0].Evening_Break_Start__c;
            tsList[0].Evening_Break_End__c = (eveningBreakEndVar != null) ? eveningBreakEndVar : tsList[0].Evening_Break_End__c;
            tsList[0].End_Time__c = (endTimeVar != null) ? endTimeVar : tsList[0].End_Time__c ;
            tsList[0].Overtime_Hours__c = overTimeHours;
            update tsList;
        }
    }     
}