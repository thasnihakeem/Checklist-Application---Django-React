import datetime
from rest_framework import serializers
from .models import PLU2Checklist, SalePosting, ADUserStatus, IdtRegister, PosDbBackup, ActionLog, ZvchrStatus, SaleStatus, AcronicsBackup, IndStoreBackup
from .models import ServerStorage, POSPDTSCALE, Store, POSStatus, PDTStatus, ScaleStatus, server, serverStatus, UPS, UPSStatus, POSPerformance
from .models import InvoiceStatus, ExpenseClaim, BackupDetail, Profile, BackupDetailVerified


class PLU2ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = PLU2Checklist
        fields = '__all__'  

class SalePostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalePosting
        fields = '__all__'

class ADUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ADUserStatus
        fields = '__all__'

class IdtRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdtRegister
        fields = '__all__' 

class PosDbBackupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PosDbBackup
        fields = '__all__'
        
class ZvchrStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZvchrStatus
        fields = '__all__'

class SaleStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleStatus
        fields = '__all__'

class AcronicsBackupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcronicsBackup
        fields = '__all__'
        
class IndStoreBackupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndStoreBackup
        fields = '__all__'
        
class ServerStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerStorage
        fields = '__all__'
        
class POSPDTSCALESerializer(serializers.ModelSerializer):
    class Meta:
        model = POSPDTSCALE
        fields = '__all__'
        
class StoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = '__all__'
 
class POSStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSStatus
        fields = '__all__'
        
class PDTStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDTStatus
        fields = '__all__'
        
class ScaleStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScaleStatus
        fields = '__all__'
             
class ActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        fields = '__all__' 
              
class ServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = server
        fields = '__all__'
  
class ServerStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = serverStatus
        fields = '__all__'
                
class UPSSerializer(serializers.ModelSerializer):
    class Meta:
        model = UPS
        fields = '__all__'
  
class UPSStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UPSStatus
        fields = '__all__'
    
class POSPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSPerformance
        fields = '__all__'
        
class InvoiceStatusSerializer(serializers.ModelSerializer):
    invoiceAmount = serializers.DecimalField(
        max_digits=10, decimal_places=2, allow_null=True, required=False
    )

    class Meta:
        model = InvoiceStatus
        fields = '__all__'
        
class ExpenseClaimSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseClaim
        fields = '__all__'

    def validate_submittedBy(self, value):
        if not isinstance(value, str):
            raise serializers.ValidationError("submittedBy must be a string.")
        return value
    
def validate_date_copied(value):
    if isinstance(value, str):
        try:
            # Try converting the string to a date object manually
            return datetime.strptime(value, '%Y-%m-%d').date()
        except ValueError:
            raise serializers.ValidationError("Invalid date format, expected YYYY-MM-DD.")
    return value

class BackupDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = BackupDetail
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
 
class BackupDetailVerifiedSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupDetailVerified
        fields = '__all__'  
