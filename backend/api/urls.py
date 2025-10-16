from django.urls import path
from .views import homeView, ldap_login, PLU2ChecklistView, SalePostingView, ADUserStatusView, GovernanceReportUpload, StoreListView, POSPDTSCALEListView, ScaleStatusView, PDTStatusView, ServerView, ProfileListView 
from .views import IdtRegisterView, PosDbBackupView, ZvchrStatusView, SaleStatusView, AcronicsBackupView, IndStoreBackupView, ServerStorageView, POSPDTScaleView, StoreView, POSStatusView, ServerListView, StoreDetailView
from .views import ServerStatusView, UPSView, UPSListView, UPSStatusView, DailyChecklist, POSListView, POSPerformanceView, InvoiceStatusView, ExpenseClaimView, POSUserStatusView, BackupDetailView, ProfileView, BackupDetailVerifiedView

urlpatterns = [
    path('api/', homeView.as_view(), name= "home"),      
    path('ldap-login/', ldap_login, name='ldap-login'),
    path('api/upload-plu2-data/', PLU2ChecklistView.as_view(), name='upload-plu2-data'),
    path('api/upload-plu2-data/<int:pk>/', PLU2ChecklistView.as_view(), name='upload-plu2-data-update'),
    path('api/plu2-checklist/download/', PLU2ChecklistView.as_view(), name='download-plu2-checklist'),
    path('api/plu2-checklist/<int:pk>/', PLU2ChecklistView.as_view(), name='plu2-checklist-detail'),
    path('api/delete-plu2-checklist/<int:id>/', PLU2ChecklistView.as_view(), name='delete-plu2-checklist'),
    path('api/plu2_checklist/', PLU2ChecklistView.as_view(), name='plu2_checklist'),
        
    path('api/submit-sale-posting/', SalePostingView.as_view(), name='submit-sale-posting'),  
    path('api/sale-posting/', SalePostingView.as_view(), name='sale-posting'), 
    path('api/update-sale-posting/<int:pk>/', SalePostingView.as_view(), name='update-sale-posting'), 
    path('api/delete-sale-posting/<int:pk>/', SalePostingView.as_view(), name='delete-sale-posting'), 
    path('api/sale-posting/download/', SalePostingView.as_view(), name='download-sale-posting'),  
    
    path('api/submit-ad-user-list/', ADUserStatusView.as_view(), name='submit-ad-user-list'), 
    path('api/update-ad-user-list/<int:id>/', ADUserStatusView.as_view(), name='update-ad-user-list'), 
    path('api/ad-user-list/download/', ADUserStatusView.as_view(), name='download-ad-user-list'),
    path('api/ad-user-status/', ADUserStatusView.as_view(), name='ad-user-status'),
    path('api/delete-ad-user/<int:id>/', ADUserStatusView.as_view(), name='delete-ad-user'),
    path('api/submit-ad-user-list/<int:pk>/', ADUserStatusView.as_view(), name='update-ad-user-list'),
    path('api/ad-user-list/', ADUserStatusView.as_view(), name='history-ad-user-list'),  
    
    path('api/upload-governance-report/', GovernanceReportUpload.as_view(), name='upload_governance_report'),
    path('api/fetch-governance-report/', GovernanceReportUpload.as_view(), name='fetch_governance_report'),
    path('api/delete-governance-report/', GovernanceReportUpload.as_view(), name='delete-governance-report'),
    path('api/download-governance-report/', GovernanceReportUpload.as_view(), name='download_governance_report'),
    
    path('api/submit-posdbbackup/', PosDbBackupView.as_view(), name='submit-posdbbackup-list'),
    path('api/posdbbackup/', PosDbBackupView.as_view(), name='posdbbackup-list'),
    path('api/update-posdbbackup/<int:pk>/', PosDbBackupView.as_view(), name='posdbbackup-update'),
    path('api/posdbbackup/download/', PosDbBackupView.as_view(), name='posdbbackup-download'),
    path('api/delete-posdbbackup/<int:pk>/', PosDbBackupView.as_view(), name='posdbbackup-delete'), 
    
    path('api/upload-zvchr-status/', ZvchrStatusView.as_view(), name='upload-zvchr-status'),
    path('api/upload-zvchr-status/<int:pk>/', ZvchrStatusView.as_view(), name='upload-zvchr-status-update'),
    path('api/zvchr-status/download/', ZvchrStatusView.as_view(), name='download-zvchr-status'),
    path('api/zvchr-status/<int:pk>/', ZvchrStatusView.as_view(), name='zvchr-status'),
    path('api/delete-zvchr-status/<int:id>/', ZvchrStatusView.as_view(), name='delete-zvchr-status'),
    path('api/zvchr-status/', ZvchrStatusView.as_view(), name='history-zvchr-status'),
        
    path('api/upload-sale-status/', SaleStatusView.as_view(), name='upload-sale-status'),
    path('api/upload-sale-status/<int:pk>/', SaleStatusView.as_view(), name='upload-sale-status-update'),
    path('api/sale-status/download/', SaleStatusView.as_view(), name='download-sale-status'),
    path('api/sale-status/<int:pk>/', SaleStatusView.as_view(), name='sale-status'),
    path('api/delete-sale-status/<int:id>/', SaleStatusView.as_view(), name='delete-sale-status'),
    path('api/sale-status/', SaleStatusView.as_view(), name='history-sale-status'),
       
    path('api/submit-acronicsbackup/', AcronicsBackupView.as_view(), name='submit-acronicsbackup-list'),
    path('api/acronicsbackup/', AcronicsBackupView.as_view(), name='acronicsbackup-list'),
    path('api/update-acronicsbackup/<int:pk>/', AcronicsBackupView.as_view(), name='acronicsbackup-update'),
    path('api/acronicsbackup/download/', AcronicsBackupView.as_view(), name='acronicsbackup-download'),
    path('api/delete-acronicsbackup/<int:pk>/', AcronicsBackupView.as_view(), name='acronicsbackup-delete'),
    
    path('api/submit-indstorebackup/', IndStoreBackupView.as_view(), name='submit-indstorebackup-list'),
    path('api/indstorebackup/', IndStoreBackupView.as_view(), name='indstorebackup-list'),
    path('api/update-indstorebackup/<int:pk>/', IndStoreBackupView.as_view(), name='indstorebackup-update'),
    path('api/indstorebackup/download/', IndStoreBackupView.as_view(), name='indstorebackup-download'),
    path('api/delete-indstorebackup/<int:pk>/', IndStoreBackupView.as_view(), name='indstorebackup-delete'),
    
    path('api/submit-serverstorage-status/', ServerStorageView.as_view(), name='submit-server-storage-status'),
    path('api/serverstorage-status/', ServerStorageView.as_view(), name='server-storage-status'),
    path('api/update-serverstorage-status/<int:pk>/', ServerStorageView.as_view(), name='server-storage-update'),
    path('api/serverstorage-status/download/', ServerStorageView.as_view(), name='server-storage-download'),
    path('api/delete-serverstorage-status/<int:pk>/', ServerStorageView.as_view(), name='server-storage-delete'),

    path('api/submit-POS-PDT-SCALE/', POSPDTScaleView.as_view(), name='submit-POS-PDT-SCALE'),
    path('api/POS-PDT-SCALE/', POSPDTScaleView.as_view(), name='POS-PDT-SCALE-list'),
    path('api/POS-PDT-SCALE/<int:pk>/', POSPDTScaleView.as_view(), name='POS-PDT-SCALE-detail'),
    path('api/update-POS-PDT-SCALE/<int:pk>/', POSPDTScaleView.as_view(), name='update-POS-PDT-SCALE'),
    path('api/delete-POS-PDT-SCALE/<int:pk>/', POSPDTScaleView.as_view(), name='delete-POS-PDT-SCALE'),
    path('api/POS-PDT-SCALE/download/', POSPDTScaleView.as_view(), name='POS-PDT-SCALE-download'),
    
    path('api/submit-store/', StoreView.as_view(), name='submit-store'),  
    path('api/manage-store/', StoreView.as_view(), name='manage-store'), 
    path('api/fetch-store/', StoreView.as_view(), name='fetch-store'),
    path('api/update-store/<int:pk>/', StoreView.as_view(), name='update-store'), 
    path('api/delete-store/<int:pk>/', StoreView.as_view(), name='delete-store'), 
    
    path('api/submit-posstatus/', POSStatusView.as_view(), name='submit-posstatus-list'),
    path('api/posstatus/', POSStatusView.as_view(), name='posstatus-list'),
    path('api/update-posstatus/<int:pk>/', POSStatusView.as_view(), name='posstatus-update'),
    path('api/posstatus/download/', POSStatusView.as_view(), name='posstatus-download'),
    path('api/delete-posstatus/<int:pk>/', POSStatusView.as_view(), name='posstatus-delete'),
    
    path('api/submit-scalestatus/', ScaleStatusView.as_view(), name='submit-scalestatus-list'),
    path('api/scalestatus/', ScaleStatusView.as_view(), name='scalestatus-list'),
    path('api/update-scalestatus/<int:pk>/', ScaleStatusView.as_view(), name='scalestatus-update'),
    path('api/scalestatus/download/', ScaleStatusView.as_view(), name='scalestatus-download'),
    path('api/delete-scalestatus/<int:pk>/', ScaleStatusView.as_view(), name='scalestatus-delete'),
    
    path('api/submit-pdtstatus/', PDTStatusView.as_view(), name='submit-pdtstatus-list'),
    path('api/pdtstatus/', PDTStatusView.as_view(), name='pdtstatus-list'),
    path('api/update-pdtstatus/<int:pk>/', PDTStatusView.as_view(), name='pdtstatus-update'),
    path('api/pdtstatus/download/', PDTStatusView.as_view(), name='pdtstatus-download'),
    path('api/delete-pdtstatus/<int:pk>/', PDTStatusView.as_view(), name='pdtstatus-delete'),
    
    path('api/stores/', StoreListView.as_view(), name='store-list'),
    path('api/store/<str:storecode>/', StoreDetailView.as_view(), name='store-detail'),  # New Route
    path('api/serverlist/', ServerListView.as_view(), name='server-list'),
    path('api/pospdtscale-numbers/', POSPDTSCALEListView.as_view(), name='pospdtscale-list'),
    path('api/upslist/', UPSListView.as_view(), name='ups-list'),

    path('api/submit-server/', ServerView.as_view(), name='submit-server'),
    path('api/server/', ServerView.as_view(), name='server-list'),
    path('api/server/<int:pk>/', ServerView.as_view(), name='server-detail'),
    path('api/update-server/<int:pk>/', ServerView.as_view(), name='update-server'),
    path('api/delete-server/<int:pk>/', ServerView.as_view(), name='delete-server'),
    path('api/server/download/', ServerView.as_view(), name='server-download'),

    path('api/submit-serverstatus/', ServerStatusView.as_view(), name='submit-serverstatus-list'),
    path('api/serverstatus/', ServerStatusView.as_view(), name='serverstatus-list'),
    path('api/update-serverstatus/<int:pk>/', ServerStatusView.as_view(), name='serverstatus-update'),
    path('api/serverstatus/download/', ServerStatusView.as_view(), name='serverstatus-download'),
    path('api/delete-serverstatus/<int:pk>/', ServerStatusView.as_view(), name='serverstatus-delete'),
    
    path('api/submit-ups/', UPSView.as_view(), name='submit-ups'),
    path('api/ups/', UPSView.as_view(), name='ups-list'),
    path('api/ups/<int:pk>/', UPSView.as_view(), name='ups-detail'),
    path('api/update-ups/<int:pk>/', UPSView.as_view(), name='update-ups'),
    path('api/delete-ups/<int:pk>/', UPSView.as_view(), name='delete-ups'),
    path('api/ups/download/', UPSView.as_view(), name='ups-download'),
    
    path('api/submit-upsamcstatus/', UPSStatusView.as_view(), name='submit-upsamcstatus-list'),
    path('api/upsamcstatus/', UPSStatusView.as_view(), name='upsamcstatus-list'),
    path('api/update-upsamcstatus/<int:pk>/', UPSStatusView.as_view(), name='upsamcstatus-update'),
    path('api/upsamcstatus/download/', UPSStatusView.as_view(), name='upsamcstatus-download'),
    path('api/delete-upsamcstatus/<int:pk>/', UPSStatusView.as_view(), name='upsamcstatus-delete'),
    
    path('api/daily-checklist/', DailyChecklist.as_view(), name='daily_checklist'),
    path('api/daily-checklist/download/',  DailyChecklist.as_view(), name='daily_checklist-download'),
    path('api/pos-numbers/', POSListView.as_view(), name='pos-list'),
    path('api/submit-posperformance/', POSPerformanceView.as_view(), name='submit-posperformance-list'),
    path('api/posperformance/', POSPerformanceView.as_view(), name='posperformance-list'),
    path('api/update-posperformance/<int:pk>/', POSPerformanceView.as_view(), name='posperformance-update'),
    path('api/posperformance/download/', POSPerformanceView.as_view(), name='posperformance-download'),
    path('api/delete-posperformance/<int:pk>/', POSPerformanceView.as_view(), name='posperformance-delete'),

    path('api/invoice-status/', InvoiceStatusView.as_view(), name='invoice-status-list'),  # List or create invoices
    path('api/invoice-status/<int:pk>/', InvoiceStatusView.as_view(), name='invoice-status-detail'),  # Retrieve or update a specific invoice
    path('api/invoice-status/download/csv/', InvoiceStatusView.as_view(), name='invoice-status-download-csv'),  # Download invoice list as CSV
    path('api/invoice-status/download/pdf/', InvoiceStatusView.as_view(), name='invoice-status-download-pdf'),  # Download invoice list as PDF
    path('api/delete-invoice-status/<int:pk>/', InvoiceStatusView.as_view(), name='delete-invoice-status'),  # Delete a specific invoice
    
    path('api/expense-status/', ExpenseClaimView.as_view(), name='expense-status-list'),  # List or create invoices
    path('api/expense-status/<int:pk>/', ExpenseClaimView.as_view(), name='expense-status-detail'),  # Retrieve or update a specific invoice
    path('api/expense-status/download/csv/', ExpenseClaimView.as_view(), name='expense-status-download-csv'),  # Download invoice list as CSV
    path('api/expense-status/download/pdf/', ExpenseClaimView.as_view(), name='expense-status-download-pdf'),  # Download invoice list as PDF
    path('api/delete-expense-status/<int:pk>/', ExpenseClaimView.as_view(), name='delete-expense-status'),  # Delete a specific invoice
    
    path('api/upload-posuserstatus/', POSUserStatusView.as_view(), name='upload_posuserstatus'),
    path('api/upload-posuserstatus-varified/', POSUserStatusView.as_view(), name='upload_varified_posuserstatus'),
    path('api/fetch-posuserstatus/', POSUserStatusView.as_view(), name='fetch_posuserstatus'),
    path('api/delete-posuserstatus/', POSUserStatusView.as_view(), name='delete-posuserstatus'),
    path('api/download-posuserstatus/', POSUserStatusView.as_view(), name='download_posuserstatus'),
    
    path('api/Idt-register/', IdtRegisterView.as_view(), name='idt-list'), 
    path('api/Idt-register/verify/', IdtRegisterView.as_view(), name='verify-idt-register'),
    path('api/submit-Idt-register/', IdtRegisterView.as_view(), name='submit-idt-register'),  
    path('api/update-Idt-register/<int:pk>/', IdtRegisterView.as_view(), name='update-idt-register'), 
    path('api/Idt-register/download/', IdtRegisterView.as_view(), name='download-idt-register'), 
    path('api/delete-Idt-register/<int:pk>/', IdtRegisterView.as_view(), name='delete-idt-register'),  
    path('api/idt-register/verify/', IdtRegisterView.as_view(), name='verify-records'), 

    path('api/backup-detail/', BackupDetailView.as_view(), name='backup-detail-list'),  # List or create backups
    path('api/backup-detail/<int:pk>/', BackupDetailView.as_view(), name='backup-detail-detail'),  # Retrieve or update a specific backup
    path('api/backup-detail/download/pdf/', BackupDetailView.as_view(), name='backup-detail-download-pdf'),  # Download backup list as PDF
    path('api/delete-backup-detail/<int:pk>/', BackupDetailView.as_view(), name='delete-backup-detail'),  # Delete a specific backup

    path('api/submit-profile/', ProfileView.as_view(), name='submit-profile'),  
    path('api/manage-profile/', ProfileView.as_view(), name='manage-profile'), 
    path('api/fetch-profile/', ProfileView.as_view(), name='fetch-profile'),
    path('api/update-profile/<int:pk>/', ProfileView.as_view(), name='update-profile'), 
    path('api/delete-profile/<int:pk>/', ProfileView.as_view(), name='delete-profile'), 
    
    path('api/profile/<str:employee_id>/', ProfileListView.as_view(), name='get_employee_profile'),

    path('api/backup-detailVerified/', BackupDetailVerifiedView.as_view(), name='backup-detail-list'),  # List or create backups
    path('api/backup-detailVerified/<int:pk>/', BackupDetailVerifiedView.as_view(), name='backup-detail-detail'),  # Retrieve or update a specific backup
    path('api/backup-detailVerified/download/pdf/', BackupDetailVerifiedView.as_view(), name='backup-detail-download-pdf'),  # Download backup list as PDF
    path('api/backup-detailVerified/<int:pk>/', BackupDetailVerifiedView.as_view(), name='delete-backup-detail'),  # Delete a specific backup
    path('api/backup/download-zip/', BackupDetailVerifiedView.as_view(), name='download-backups-zip'),
]



