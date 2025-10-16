from django.db import models
from django.utils import timezone

class PLU2Checklist(models.Model):
    store= models.CharField(max_length=10, db_index=True)
    storename = models.CharField(max_length=255)
    plu2Status = models.CharField(max_length=255)
    eodStatus = models.CharField(max_length=255)
    idocFileStatus = models.CharField(max_length=255)
    comparisonCheck = models.CharField(max_length=255, blank=True, null=True)
    folderStatus = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)
    date = models.DateField(db_index=True)
    zread = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    customercount = models.CharField(max_length=255, blank=True, null=True)
    submittedby = models.TextField(max_length=255)
    submitted_time =  models.DateTimeField()
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]

    def __str__(self):
        return f"{self.store} - {self.plu2Status}"

class SalePosting(models.Model):
    store = models.CharField(max_length=10, db_index=True)
    storename = models.CharField(max_length=255)
    totalpayment = models.DecimalField(max_digits=20, decimal_places=2)
    expectedpayment = models.DecimalField(max_digits=20, decimal_places=2)
    actualpayment = models.DecimalField(max_digits=20, decimal_places=2)
    cashiershortexcess = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    zdsr = models.DecimalField(max_digits=20, decimal_places=2)
    zread = models.DecimalField(max_digits=20, decimal_places=2)
    zdsrzread = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    posrounding = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    zpmc = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    difference = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    totalarticlesale = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    exception = models.DecimalField(max_digits=20, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(null=True, blank=True)
    date = models.DateField(db_index=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField(default="2024-01-01 00:00:00")
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
        
    def __str__(self):
        return f"Sale Posting {self.store} on {self.date}"
    
class ADUserStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=10, db_index=True)
    storename = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    statuschange = models.CharField(max_length=100)
    accounttype = models.CharField(max_length=100)
    userlogonname = models.CharField(max_length=255)
    accountstatus = models.CharField(max_length=50)
    ticketno = models.CharField(max_length=100, null=True, blank=True)
    ticketstatus = models.CharField(max_length=50, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    filename = models.CharField(max_length=255, null=True, blank=True)  
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
        
    def __str__(self):
        return f'{self.name} ({self.store})'
    
class IdtRegister(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=255, db_index=True)
    storename = models.CharField(max_length=255)
    vendorName = models.CharField(max_length=255, null=True, blank=True)
    vendorPhone = models.CharField(max_length=50, null=True, blank=True)
    purpose = models.TextField()
    accessType = models.CharField(max_length=50)
    inTime = models.TimeField()
    outTime = models.TimeField()
    assistedby = models.CharField(max_length=50, null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    submittedby = models.TextField(max_length=255)
    
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
        
    def __str__(self):
        return f"IDT Register {self.date} - {self.store}"

class PosDbBackup(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=10, db_index=True)
    storename = models.CharField(max_length=255)
    filename = models.CharField(max_length=255)
    datebackup = models.DateField()
    size = models.TextField(max_length=100,null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f"PosDbBackup {self.store} - {self.date}"

class ZvchrStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=255)
    pter = models.CharField(max_length=100)
    ptes = models.CharField(max_length=100)
    ptvr = models.CharField(max_length=100)
    ptvs = models.CharField(max_length=100)
    zqer = models.CharField(max_length=100)
    zqgr = models.CharField(max_length=100)
    zqgs = models.CharField(max_length=100)
    remarks = models.TextField(blank=True, null=True)
    submitted_time = models.DateTimeField(null=True) 
    submittedby = models.TextField(max_length=255)
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f"{self.store} - {self.date}"

class SaleStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100,db_index=True)
    storename = models.CharField(max_length=255)
    zdsr = models.CharField(max_length=255)
    zcasr = models.CharField(max_length=255)
    zread = models.CharField(max_length=255)
    zpmc = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)
    submittedby = models.TextField(max_length=255)    
    submitted_time = models.DateTimeField(null=True) 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f"SaleStatus {self.date} - {self.store}"

class AcronicsBackup(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=255)
    servername = models.CharField(max_length=255)
    tpcentraldb = models.CharField(max_length=255)
    tpcmdb = models.CharField(max_length=100)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f"AcronicsBackup {self.store} - {self.date}"

class IndStoreBackup(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100,db_index=True)
    storename = models.CharField(max_length=100)
    servername = models.CharField(max_length=255)
    tpcentraldb = models.CharField(max_length=255)
    tpcmdb = models.CharField(max_length=100)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)    
    submitted_time = models.DateTimeField()
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True) 
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f"IndStoreBackup {self.store} - {self.date}"

class ServerStorage(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    servername = models.CharField(max_length=255)
    harddrive = models.CharField(max_length=255)
    totalspace = models.DecimalField(max_digits=20, decimal_places=2)
    freespace = models.DecimalField(max_digits=20, decimal_places=2)
    usedspace = models.DecimalField(max_digits=20, decimal_places=2)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)    
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]    
    
    def __str__(self):
        return f"ServerStorage {self.store} - {self.date}"

class POSPDTSCALE(models.Model):
    store = models.CharField(max_length=100, db_index=True)
    section = models.CharField(max_length=255)
    type = models.CharField(max_length=255, db_index=True)
    typenumber = models.CharField(max_length=255)
    counternumber = models.CharField(max_length=255, null=True, blank=True)
    submitted_time = models.DateTimeField() 
    class Meta:
        indexes = [
            models.Index(fields=["store", "type"]),
        ]
    def __str__(self):
        return f"{self.store} - {self.type}"

class Store(models.Model):
    storecode = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=255)
    itmanager = models.CharField(max_length=255, null=True, blank=True)
    itincharge = models.CharField(max_length=255, null=True, blank=True)
    assitincharge = models.CharField(max_length=255, null=True, blank=True)
    submitted_time = models.DateTimeField() 
    cio = models.CharField(max_length=255, default="Anil Menon", null=True, blank=True)
    admin_manager = models.CharField(max_length=255, default="Sreejith CS", null=True, blank=True)
    
    def __str__(self):
        return f"{self.storecode} - {self.storename}"
 
class POSStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    section = models.CharField(max_length=255)
    posnumber = models.CharField(max_length=255)
    counternumber = models.CharField(max_length=255)
    complaint = models.TextField(null=True, blank=True)
    actiontaken = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f" {self.store} - {self.date}"

class ActionLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Created'),
        ('UPDATE', 'Updated'),
        ('DELETE', 'Deleted'),
        ('FETCH', 'Fetched'),
        ('DOWNLOAD', 'Downloaded'),
        ('VERIFIED', 'Verified')
    ]

    view_name = models.CharField(max_length=255, db_index=True)  
    action = models.CharField(max_length=150, choices=ACTION_CHOICES)
    user = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    details = models.JSONField()  
    related_object = models.JSONField(null=True, blank=True) 
    class Meta:
        indexes = [
            models.Index(fields=['view_name', 'timestamp']),
        ]


    def __str__(self):
        return f"{self.action} by {self.user} in {self.view_name} on {self.timestamp}"

class PDTStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    section = models.CharField(max_length=255)
    pdtnumber = models.CharField(max_length=255)
    complaint = models.TextField(null=True, blank=True)
    actiontaken = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]    
    def __str__(self):
        return f" {self.store} - {self.date}"

class ScaleStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    section = models.CharField(max_length=255)
    scalenumber = models.CharField(max_length=255)
    complaint = models.TextField(null=True, blank=True)
    actiontaken = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]
    def __str__(self):
        return f" {self.store} - {self.date}"

class server(models.Model):
    store = models.CharField(max_length=100, db_index=True)
    servername = models.CharField(max_length=255)
    serialnumber = models.TextField(max_length=255)
    modelname = models.TextField(max_length=255)
    warrantyexp = models.DateField()
    amc = models.TextField(null=True, blank=True)
    submitted_time = models.DateTimeField() 
    
    def __str__(self):
        return f" {self.store}"

class serverStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    ac = models.CharField(max_length=100)
    servername = models.CharField(max_length=255)
    serialnumber = models.TextField(max_length=255)
    modelname = models.TextField(max_length=255)
    warrantyexp = models.DateField()
    amc = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=255)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)    
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]    
    def __str__(self):
        return f" {self.store}"

class UPS(models.Model):
    store = models.CharField(max_length=100, db_index=True)
    ups = models.CharField(max_length=255)
    serialnumber = models.CharField(max_length=255)
    vendorname = models.CharField(max_length=255, blank=True, null=True)
    brand = models.CharField(max_length=255, blank=True, null=True)
    area = models.CharField(max_length=255, blank=True, null=True)
    capacity = models.CharField(max_length=255, blank=True, null=True)
    warrantyexp = models.DateField(null=True, blank=True)
    amcstartdate = models.DateField(null=True, blank=True)
    amcenddate = models.DateField(null=True, blank=True)
    submitted_time = models.DateTimeField()

    def __str__(self):
        return f"{self.store} - {self.ups} ({self.serialnumber})"
    
class UPSStatus(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100, db_index=True)
    storename = models.CharField(max_length=100)
    ups = models.CharField(max_length=255)
    ac = models.CharField(max_length=10)
    serialnumber = models.TextField(max_length=255)
    vendorname = models.TextField(max_length=255)
    brand = models.TextField(max_length=255)
    area = models.TextField(max_length=255)
    capacity = models.TextField(max_length=255)
    type =  models.TextField(max_length=255)
    warrantyexp = models.DateField(null=True, blank=True)
    amcstartdate = models.DateField(null=True, blank=True)
    amcenddate = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=255)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)    
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]        
    def __str__(self):
        return f" {self.store} - {self.date}"
    
class POSPerformance(models.Model):
    date = models.DateField(db_index=True)
    store = models.CharField(max_length=100,db_index=True)
    storename = models.CharField(max_length=100)
    posnumber = models.CharField(max_length=255)
    posuptime = models.DecimalField(max_digits=20, decimal_places=2)
    posdowntime = models.DecimalField(max_digits=20, decimal_places=2)
    remarks = models.TextField(null=True, blank=True)
    submittedby = models.TextField(max_length=255)
    submitted_time = models.DateTimeField() 
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    verified = models.BooleanField(default=False) 
    verifiedby = models.CharField(max_length=255, blank=True, null=True)
    class Meta:
        indexes = [
            models.Index(fields=["store", "date"]),
        ]        
    def __str__(self):
        return f" {self.store} - {self.date}"

class InvoiceStatus(models.Model):
    date = models.DateField(db_index=True)
    invoiceType = models.CharField(max_length=100)
    vendorName = models.CharField(max_length=255)
    invoiceAmount = models.DecimalField(max_digits=10, decimal_places=2)  # Adjust as per expected max value
    approvedBy = models.CharField(max_length=255)
    submittedBy = models.CharField(max_length=255)
    hdDate = models.DateField(null=True, blank=True)
    reCollectingDate = models.DateField(null=True, blank=True)
    finalStatus = models.CharField(max_length=255)
    finalUpdation = models.TextField(null=True, blank=True)
    

    def __str__(self):
        return f"{self.invoiceType} - {self.date} - {self.vendorName}"
    
class ExpenseClaim(models.Model):
    date = models.DateField(db_index=True)
    nameOfRequester = models.CharField(max_length=100)
    designation = models.CharField(max_length=255)
    claimAmount = models.DecimalField(max_digits=10, decimal_places=2)  # Adjust as per expected max value
    purpose = models.CharField(max_length=255)
    managerApproval = models.CharField(max_length=255)
    submittedBy = models.CharField(max_length=255)
    hdDateToSree = models.DateField(null=True, blank=True)
    cioApproval = models.CharField(max_length=255)
    hdDateToRahul = models.DateField(null=True, blank=True)
    reCollectingDateFrom7th = models.DateField(null=True, blank=True)
    finalStatus = models.TextField(null=True, blank=True)
    def __str__(self):
        return f"{self.nameOfRequester} - {self.date} - {self.designation}"
    
class BackupDetail(models.Model):
    date = models.DateField(db_index=True)
    year = models.CharField(max_length=4,null=True, blank=True)  # Ensure it matches frontend
    empid = models.CharField(max_length=255, null=False, blank=False)
    fullname = models.CharField(max_length=255)  # Full Name
    designation = models.CharField(max_length=255)  # Designation
    verifierName = models.CharField(max_length=255)
    verifierEmpid = models.CharField(max_length=100)  # Verifier Employee ID
    verifierDesignation = models.CharField(max_length=255)
    site = models.CharField(max_length=10, db_index=True )  # Site ID
    dateCopied1 = models.DateField(null=True, blank=True)
    dateCopied2 = models.DateField(null=True, blank=True)
    fileName1 = models.CharField(max_length=255)
    fileName2 = models.CharField(max_length=255)
    serverName = models.CharField(max_length=255, blank=True)
    size1 = models.CharField(max_length=100)
    size2 = models.CharField(max_length=100)
    ipAddress = models.CharField(max_length=15, null=True, blank=True)
    frequency = models.CharField(max_length=255)
    typeOfBackup = models.CharField(max_length=255, blank=True)
    failed_dates = models.JSONField(default=list)  
    success_dates = models.JSONField(default=list, null=True, blank=True)
    reviewMonth = models.CharField(max_length=20, null=True, blank=True)  # Example: "March"

    class Meta:
        indexes = [
            models.Index(fields=["site", "date"]),
        ]        
    def __str__(self):
     return f"{self.site} ({self.fileName1}) - {self.date} ({self.year if self.year else 'Unknown Year'})"

class BackupDetailVerified(models.Model):
    store = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    file = models.FileField(upload_to='backups/', null=True, blank=True)
    reviewMonth1 = models.CharField(max_length=20, null=False, blank=False) 
    year = models.CharField(max_length=4,null=True, blank=True)  # Ensure it matches frontend
    def __str__(self):
        return f"{self.store} ({self.file})"
              
class Profile(models.Model):
    storecode = models.CharField(max_length=100, db_index=True)
    employeeid = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, null=True, blank=True)
    submitted_time = models.DateTimeField() 
    storeunder = models.CharField(max_length=255, null=True, blank=True)
    cio = models.CharField(max_length=255, default="Anil Menon", null=True, blank=True)
    admin_manager = models.CharField(max_length=255, default="Sreejith CS", null=True, blank=True)
    
    def __str__(self):
        return f"{self.storecode} - {self.employeeid}"
            