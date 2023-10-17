@isTest
public class EmployeeTimesheetTest {
    
    @isTest
    static void testGetTimeSheetRecords(){
        
        Monthly_Timesheet__c testMonthlyTimesheet = new Monthly_Timesheet__c(
            Month__c = 'June',
            Year__c = 2023,
            User__c = UserInfo.getUserId()
        );
        
        insert testMonthlyTimesheet;
        
        Timesheet__c testTimesheet = new Timesheet__c(
            Start_Time__c = Time.newInstance(10, 00, 0, 00),
            End_Time__c = Time.newInstance(19, 00, 0, 00),
            Lunch_Start__c = Time.newInstance(12, 00, 0, 00),
            Lunch_End__c = Time.newInstance(13, 00, 0, 00),
            Date__c = date.newinstance(2023, 6, 5),
            Overtime_Hours__c = 0,
            User__c = UserInfo.getUserId(),
            Monthly_Timesheet__c = testMonthlyTimesheet.id
        );
        insert testTimesheet;
        
        list<Timesheet__c> timesheetList = EmployeeTimesheet.getTimeSheetRecords('June');
        
        System.assertEquals(testTimesheet.Id, timesheetList[0].Id);
    }
    
    @isTest
    static void negativeTestGetTimeSheetRecords(){
        
        
        Monthly_Timesheet__c testMonthlyTimesheet = new Monthly_Timesheet__c(
            Month__c = 'June',
            Year__c = 2023,
            User__c = UserInfo.getUserId()
        );
        insert testMonthlyTimesheet;
        
        Timesheet__c testTimesheet = new Timesheet__c(
            Start_Time__c = Time.newInstance(10, 00, 0, 00),
            End_Time__c = Time.newInstance(19, 00, 0, 00),
            Lunch_Start__c = Time.newInstance(12, 00, 0, 00),
            Lunch_End__c = Time.newInstance(13, 00, 0, 00),
            Date__c = date.newinstance(2023, 6, 5),
            Overtime_Hours__c = 0,
            User__c = UserInfo.getUserId(),
            Monthly_Timesheet__c = testMonthlyTimesheet.id
        );
        insert testTimesheet;
        
        list<Timesheet__c> timesheetList = EmployeeTimesheet.getTimeSheetRecords('July');
        
        System.assertEquals(0, timesheetList.size());
    }
    
    @IsTest
    public static void testGetLeaveRequestRecord() {
        
        User currentUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        
        Contact c = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            User__c = currentUser.Id 
        );
        insert c;
        
        Leave_Request__c testLeaveRequest = new Leave_Request__c(
            Start_Date__c = DateTime.newInstance(2023, 6, 14, 10, 0, 0),
            End_Date__c = DateTime.newInstance(2023, 6, 16, 17, 0, 0),
            Status__c = 'Approved'
            //Contact__c = c.Id
        );
        insert testLeaveRequest;
        
        Boolean result = EmployeeTimesheet.getLeaveRequestRecord('15/6/2023');
        
        
        System.assertEquals(true, result);       
    }
    
    @isTest
    static void testGetLeaveRequestRecord_NegativeScenario() {
        User currentUser = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
        
        Contact c = new Contact(
            FirstName = 'John',
            LastName = 'Doe',
            Email = 'johndoe@example.com',
            User__c = currentUser.Id 
        );
        insert c;
        
        Leave_Request__c testLeaveRequest = new Leave_Request__c(
            Start_Date__c = DateTime.newInstanceGmt(2023, 6, 2, 7, 30, 0), 
            End_Date__c = DateTime.newInstanceGmt(2023, 6, 3, 12, 00, 0),
            //Contact__c = c.Id,
            Status__c = 'Approved'
        );
        insert testLeaveRequest;
        
        boolean result = EmployeeTimesheet.getLeaveRequestRecord('4/6/2023'); 
        
        System.assertEquals(false, result);
    }
    
    @isTest
    static void testInsertTimeSheet() {
        
        Monthly_Timesheet__c testMonthlyTimesheet = new Monthly_Timesheet__c(
            Month__c = 'June',
            Year__c = 2023,
            User__c = UserInfo.getUserId()
        );
        insert testMonthlyTimesheet;
        
        Timesheet__c testTimesheet = new Timesheet__c(
            Start_Time__c = Time.newInstance(10, 00, 0, 00),
            End_Time__c = Time.newInstance(19, 00, 0, 00),
            Lunch_Start__c = Time.newInstance(12, 00, 0, 00),
            Lunch_End__c = Time.newInstance(13, 00, 0, 00),
            Date__c = date.newinstance(2023, 6, 5),
            Overtime_Hours__c = 0,
            User__c = UserInfo.getUserId(),
            Monthly_Timesheet__c = testMonthlyTimesheet.id
        );
        insert testTimesheet;
        
        
        EmployeeTimesheet.insertTimeSheet(
            'June',
            '5/6/2023',
            '10:00:00.000',
            '12:00:00.000',
            '13:00:00.000',
            '19:00:00.000',
            0 
        );
        Timesheet__c insertedTimesheet = [
            SELECT Id, Start_Time__c, Lunch_Start__c, Lunch_End__c, End_Time__c, Overtime_Hours__c
            FROM Timesheet__c
            WHERE Id = :testTimesheet.Id
        ];
        
        System.assertEquals(testTimesheet.Start_Time__c, insertedTimesheet.Start_Time__c  );
        System.assertEquals(testTimesheet.Lunch_Start__c, insertedTimesheet.Lunch_Start__c);
        System.assertEquals(testTimesheet.Lunch_End__c, insertedTimesheet.Lunch_End__c);
        System.assertEquals(testTimesheet.End_Time__c, insertedTimesheet.End_Time__c);
        System.assertEquals(testTimesheet.Overtime_Hours__c, insertedTimesheet.Overtime_Hours__c);
    }    
    
    
    @isTest
    static void testInsertTimeSheet_NegativeScenario() {
        Monthly_Timesheet__c testMonthlyTimesheet = new Monthly_Timesheet__c(
            Month__c = 'June',
            Year__c = 2023,
            User__c = UserInfo.getUserId()
        );
        insert testMonthlyTimesheet;
        
        Timesheet__c testTimesheet = new Timesheet__c(
            Start_Time__c = Time.newInstance(10, 0, 0, 0),
            End_Time__c = Time.newInstance(19, 0, 0, 0),
            Lunch_Start__c = Time.newInstance(12, 0, 0, 0),
            Lunch_End__c = Time.newInstance(13, 0, 0, 0),
            Date__c = Date.newInstance(2023, 6, 5),
            Overtime_Hours__c = 0,
            User__c = UserInfo.getUserId(),
            Monthly_Timesheet__c = testMonthlyTimesheet.Id
        );
        insert testTimesheet;
        
        List<Timesheet__c> insertedTimesheets = [
            SELECT Id, Start_Time__c, Lunch_Start__c, Lunch_End__c, End_Time__c, Overtime_Hours__c
            FROM Timesheet__c
            WHERE Monthly_Timesheet__c = :testMonthlyTimesheet.Id
        ];
        
        Boolean exceptionThrown = false;
        try {
            
            EmployeeTimesheet.insertTimeSheet(
                'June',
                '5/6/2023',
                '25:00:00.000', 
                '12:00:00.000',
                '13:00:00.000',
                '19:00:00.000',
                0
            );
        } catch (Exception e) {
            
            exceptionThrown = true;
        }    
        System.assertEquals(false, exceptionThrown);
    }
    
    @isTest
    static void testUpdateTimeSheet() {
        
        Monthly_Timesheet__c testMonthlyTimesheet = new Monthly_Timesheet__c(
            Month__c = 'June',
            Year__c = 2023,
            User__c = UserInfo.getUserId()
        );
        insert testMonthlyTimesheet;
        
        /*Timesheet__c testTimesheet = new Timesheet__c(
            Start_Time__c = Time.newInstance(10, 00, 0, 00),
            End_Time__c = Time.newInstance(19, 00, 0, 00),
            Lunch_Start__c = Time.newInstance(12, 00, 0, 00),
            Lunch_End__c = Time.newInstance(13, 00, 0, 00),
            Date__c = date.newinstance(2023, 6, 5),
            Overtime_Hours__c = 0,
            User__c = UserInfo.getUserId(),
            Monthly_Timesheet__c = testMonthlyTimesheet.id
        );
        insert testTimesheet;
        */
        
        EmployeeTimesheet.insertTimeSheet(
            'June',
            '5/6/2023',
            '10:00:00.000',
            '12:00:00.000',
            '13:00:00.000',
            '19:00:00.000',
            0 
        );
        date currentDate = Date.valueOf('5/6/2023'); 
        Timesheet__c insertedTimesheet = [
            SELECT Id, Start_Time__c, Lunch_Start__c, Lunch_End__c, End_Time__c, Overtime_Hours__c
            FROM Timesheet__c WHERE Date__c = :currentDate
        ];
        
        System.assertEquals(Time.newInstance(10, 00, 00, 00) , insertedTimesheet.Start_Time__c  );
        System.assertEquals(Time.newInstance(12, 00, 00, 00) , insertedTimesheet.Lunch_Start__c);
        System.assertEquals(Time.newInstance(13, 00, 00, 00) , insertedTimesheet.Lunch_End__c);
        System.assertEquals(Time.newInstance(19, 00, 00, 00), insertedTimesheet.End_Time__c);
        System.assertEquals(0, insertedTimesheet.Overtime_Hours__c);
    }
    @isTest
    static void testCreateMonthlyTimeSheet(){
        EmployeeTimesheet.insertTimeSheet(
            'June',
            '5/6/2023',
            '10:00:00.000',
            '12:00:00.000',
            '13:00:00.000',
            '19:00:00.000',
            null
            
        );
        date currentDate = Date.valueOf('5/6/2023'); 
        Timesheet__c insertedTimesheet = [
            SELECT Id, Start_Time__c, Lunch_Start__c, Lunch_End__c, End_Time__c, Overtime_Hours__c
            FROM Timesheet__c WHERE Date__c = :currentDate
        ];
        
        System.assertEquals(Time.newInstance(10, 00, 00, 00) , insertedTimesheet.Start_Time__c  );
        System.assertEquals(Time.newInstance(12, 00, 00, 00) , insertedTimesheet.Lunch_Start__c);
        System.assertEquals(Time.newInstance(13, 00, 00, 00) , insertedTimesheet.Lunch_End__c);
        System.assertEquals(Time.newInstance(19, 00, 00, 00), insertedTimesheet.End_Time__c);
        System.assertEquals(0, insertedTimesheet.Overtime_Hours__c);
    }
    
}