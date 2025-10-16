import calendar
import os
import csv
import json
import glob
import zipfile
from io import BytesIO
from django.conf import settings
from rest_framework import status
from reportlab.pdfgen import canvas
from django.shortcuts import render
from rest_framework.views import APIView
from reportlab.lib.pagesizes import letter
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from django.http import FileResponse, Http404
from django.http import HttpResponse, JsonResponse
from ldap3 import Server, Connection, ALL, SUBTREE
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import PLU2Checklist, SalePosting, ADUserStatus, IdtRegister, PosDbBackup, ActionLog, ZvchrStatus, SaleStatus, AcronicsBackup, IndStoreBackup, ServerStorage, Profile
from .models import POSPDTSCALE, Store, POSStatus, PDTStatus, ScaleStatus, server, serverStatus, UPS, UPSStatus, POSPerformance, InvoiceStatus, ExpenseClaim, BackupDetail, BackupDetailVerified
from .serializers import PLU2ChecklistSerializer, SalePostingSerializer, ADUserStatusSerializer, IdtRegisterSerializer , PosDbBackupSerializer, ZvchrStatusSerializer, ScaleStatusSerializer, PDTStatusSerializer, UPSSerializer
from .serializers import SaleStatusSerializer, AcronicsBackupSerializer, IndStoreBackupSerializer, ServerStorageSerializer, POSPDTSCALESerializer, StoreSerializer,POSStatusSerializer, ServerSerializer, ServerStatusSerializer
from .serializers import UPSStatusSerializer, POSPerformanceSerializer, ExpenseClaimSerializer, InvoiceStatusSerializer, BackupDetailSerializer, ProfileSerializer , BackupDetailVerifiedSerializer
from django.utils.timezone import now
from datetime import datetime
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib import colors
from PIL import ImageOps 
from fpdf import FPDF
import re
from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile  

def process_status1(store, date, model, checklist_name):
    ok_count = 0
    not_ok_count = 0
    not_ok_details = []

    if hasattr(model, 'status'):
        if checklist_name == "POS":
            records = list(model.objects.filter(store=store.storecode, date=date).values("posnumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = record["status"]
                    if status == "Ok":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - {list(record.values())[0]}, Status: {status}")

        elif checklist_name == "Scale":
            records = list(model.objects.filter(store=store.storecode, date=date).values("scalenumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = record["status"]
                    if status == "Ok":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - {list(record.values())[0]}, Status: {status}")

        elif checklist_name == "PDT":
            records = list(model.objects.filter(store=store.storecode, date=date).values("pdtnumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = record["status"]
                    if status == "Ok":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - {list(record.values())[0]}, Status: {status}")

        elif checklist_name == "UPS":
            records = list(model.objects.filter(store=store.storecode, date=date).values("ups", "warrantyexp", "amcstartdate", "amcenddate", "status", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = record["status"]
                    if status == "Ok":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - {list(record.values())[0]}, Status: {status}")

        elif checklist_name == "Server":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "warrantyexp", "status", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = record["status"]
                    if status == "Ok":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - {list(record.values())[0]}, Status: {status}")

    elif hasattr(model, 'tpcentraldb') and hasattr(model, 'tpcmdb'):
        if checklist_name == "Ind Store Backup":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    for key in ["tpcentraldb", "tpcmdb"]:
                        status = "OK" if record[key] == "Ok" else "Not Ok"
                        if status == "OK":
                            ok_count += 1
                        else:
                            not_ok_count += 1
                            not_ok_details.append(f"{checklist_name} - {record['servername']}, {key}: {status}")
        
        if checklist_name == "Acronics Backup":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    for key in ["tpcentraldb", "tpcmdb"]:
                        status = "OK" if record[key] == "Ok" else "Not Ok"
                        if status == "OK":
                            ok_count += 1
                        else:
                            not_ok_count += 1
                            not_ok_details.append(f"{checklist_name} - {record['servername']}, {key}: {status}")
        
    elif hasattr(model, 'zcasr') and hasattr(model, 'zdsr') and hasattr(model, 'zpmc') and hasattr(model, 'zread'):
        if checklist_name == "Sales Status":
            records = list(model.objects.filter(store=store.storecode, date=date).values("zcasr", "zdsr", "zpmc", "zread", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    for key in ["zcasr", "zdsr", "zpmc", "zread"]:
                        status = "OK" if record[key] == "Updated" else "Not Ok"
                        if status == "OK":
                            ok_count += 1
                        else:
                            not_ok_count += 1
                            not_ok_details.append(f"{checklist_name} - {key}: {status}")
        
    else:
        if checklist_name == "POS DB Backup":
            records = list(model.objects.filter(store=store.storecode, date=date).values("filename","size","datebackup", "remarks"))
            if not records:
                ok_count = 0
                not_ok_count= 0
            else:
                for record in records:
                    status = "OK" if str(record["datebackup"]) == str(date) else "Not Ok"
                    if status == "OK":
                        ok_count += 1
                    else:
                        not_ok_count += 1
                        not_ok_details.append(f"{checklist_name} - Backup mismatch: {record['filename']}, Size: {record['size']}, Backup Date: {record['datebackup']}")

    return ok_count, not_ok_count, not_ok_details

def process_status_plu2(store, date):
    records = PLU2Checklist.objects.filter(store=store.storecode, date=date).values(
        "plu2Status", "eodStatus", "idocFileStatus", "folderStatus"
    )
    if not records:
        return {
            "plu2Status": "No Data",
            "eodStatus": "No Data",
            "idocFileStatus": "No Data",
            "folderStatus": "No Data",
        }
    return records[0]

def process_status2(store, date, model, checklist_name):
    statuses = []
    no_data_found = True
    
    if hasattr(model, 'status'):
        if checklist_name == "POS":
            records = list(model.objects.filter(store=store.storecode, date=date).values("posnumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    status = record["status"]
                    statuses.append(status)

        elif checklist_name == "Scale":
            records = list(model.objects.filter(store=store.storecode, date=date).values("scalenumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    status = record["status"]
                    statuses.append(status)

        elif checklist_name == "PDT":
            records = list(model.objects.filter(store=store.storecode, date=date).values("pdtnumber", "status", "complaint", "actiontaken", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    status = record["status"]
                    statuses.append(status)

        elif checklist_name == "UPS":
            records = list(model.objects.filter(store=store.storecode, date=date).values("ups", "warrantyexp", "amcstartdate", "amcenddate", "status", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    status = record["status"]
                    statuses.append(status)

        elif checklist_name == "Server":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "warrantyexp", "status", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    status = record["status"]
                    statuses.append(status)

    elif hasattr(model, 'tpcentraldb') and hasattr(model, 'tpcmdb'):
        if checklist_name == "Ind Store Backup":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    server_name = record["servername"]
                    tpcentraldb_status = "OK" if record["tpcentraldb"] == "Ok" else "Not Ok"
                    tpcmdb_status = "OK" if record["tpcmdb"] == "Ok" else "Not Ok"
                    statuses.extend([tpcentraldb_status, tpcmdb_status])

        if checklist_name == "Acronics Backup":
            records = list(model.objects.filter(store=store.storecode, date=date).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    server_name = record["servername"]
                    tpcentraldb_status = "OK" if record["tpcentraldb"] == "Ok" else "Not Ok"
                    tpcmdb_status = "OK" if record["tpcmdb"] == "Ok" else "Not Ok"
                    statuses.extend([tpcentraldb_status, tpcmdb_status])

    elif hasattr(model, 'zcasr') and hasattr(model, 'zdsr') and hasattr(model, 'zpmc') and hasattr(model, 'zread'):
        if checklist_name == "Sales Status":
            records = list(model.objects.filter(store=store.storecode, date=date).values("zcasr", "zdsr", "zpmc", "zread", "remarks"))
            if not records:
                statuses.append("Not Available")
                no_data_found = False
            else:
                for record in records:
                    zcasr_status = "OK" if record["zcasr"] == "Updated" else "Not Ok"
                    zdsr_status = "OK" if record["zdsr"] == "Updated" else "Not Ok"
                    zpmc_status = "OK" if record["zpmc"] == "Updated" else "Not Ok"
                    zread_status = "OK" if record["zread"] == "Updated" else "Not Ok"
                    statuses.extend([zcasr_status, zdsr_status, zpmc_status, zread_status])

    if no_data_found:
        overall_status = "Not Ok" if "Not Ok" in statuses else "Ok"
    else:
        overall_status = "Not Available"
    return overall_status

class homeView(APIView):
    """
    Class-based view for fetching and aggregating store status data.
    """

    def get_queryset_maps(self, store_codes, today, yesterday):
        """
        Batch fetch all related querysets and group them by store.
        Returns a dictionary of grouped querysets.
        """
        # Fetch querysets
        queryset_map = {
            "plu2": PLU2Checklist.objects.filter(store__in=store_codes, date=yesterday),
            "sale": SalePosting.objects.filter(store__in=store_codes, date=yesterday),
            "pos_status": POSStatus.objects.filter(store__in=store_codes, date=today),
            "pdt_status": PDTStatus.objects.filter(store__in=store_codes, date=today),
            "scale_status": ScaleStatus.objects.filter(store__in=store_codes, date=today),
            "server_status": serverStatus.objects.filter(store__in=store_codes, date=today),
            "ups_status": UPSStatus.objects.filter(store__in=store_codes, date=today),
            "pos_performance": POSPerformance.objects.filter(store__in=store_codes, date=yesterday),
            "pos_backup": PosDbBackup.objects.filter(store__in=store_codes, date=today),
            "zvchr_status": ZvchrStatus.objects.filter(store__in=store_codes, date=yesterday),
            "sale_status": SaleStatus.objects.filter(store__in=store_codes, date=yesterday),
            "acronics_backup": AcronicsBackup.objects.filter(store__in=store_codes, date=today),
            "ind_store_backup": IndStoreBackup.objects.filter(store__in=store_codes, date=today),
            "server_storage": ServerStorage.objects.filter(store__in=store_codes, date=today),
        }

        # Helper to group by store
        def group_by_store(queryset):
            grouped = {}
            for obj in queryset:
                grouped.setdefault(obj.store, []).append(obj)
            return grouped

        # Convert to grouped dicts
        return {k: group_by_store(v) for k, v in queryset_map.items()}

    def build_store_data(self, store, storecode, maps, today, yesterday):
        """
        Build the structured data dictionary for a single store.
        Uses process_status1, process_status2, and process_status_plu2.
        """

        plu2 = maps["plu2"].get(storecode, [])
        sale = maps["sale"].get(storecode, [])
        pos_status = maps["pos_status"].get(storecode, [])
        pdt_status = maps["pdt_status"].get(storecode, [])
        scale_status = maps["scale_status"].get(storecode, [])
        server_status = maps["server_status"].get(storecode, [])
        ups_status = maps["ups_status"].get(storecode, [])
        pos_performance = maps["pos_performance"].get(storecode, [])
        pos_backup = maps["pos_backup"].get(storecode, [])
        zvchr_status = maps["zvchr_status"].get(storecode, [])
        sale_status = maps["sale_status"].get(storecode, [])
        acronics_backup = maps["acronics_backup"].get(storecode, [])
        ind_store_backup = maps["ind_store_backup"].get(storecode, [])
        server_storage = maps["server_storage"].get(storecode, [])

        # Sale posting data
        sale_posting_data = {}
        if sale:
            first_sale = sale[0]
            sale_posting_data = {
                "totalpayment": getattr(first_sale, "totalpayment", "No Data"),
                "expectedpayment": getattr(first_sale, "expectedpayment", "No Data"),
                "actualpayment": getattr(first_sale, "actualpayment", "No Data"),
                "cashiershortexcess": getattr(first_sale, "cashiershortexcess", "No Data"),
                "zdsr": getattr(first_sale, "zdsr", "No Data"),
                "zread": getattr(first_sale, "zread", "No Data"),
                "zdsrzread": getattr(first_sale, "zdsrzread", "No Data"),
                "posrounding": getattr(first_sale, "posrounding", "No Data"),
                "zpmc": getattr(first_sale, "zpmc", "No Data"),
            }
        else:
            sale_posting_data = {k: "No Data" for k in [
                "totalpayment", "expectedpayment", "actualpayment", "cashiershortexcess",
                "zdsr", "zread", "zdsrzread", "posrounding", "zpmc"
            ]}

        # Call process_status functions
        pos_ok, pos_not_ok, pos_not_ok_details = process_status1(store, today, POSStatus, "POS")
        scale_ok, scale_not_ok, _ = process_status1(store, today, ScaleStatus, "Scale")
        pdt_ok, pdt_not_ok, _ = process_status1(store, today, PDTStatus, "PDT")
        ups_ok, ups_not_ok, _ = process_status1(store, today, UPSStatus, "UPS")
        server_ok, server_not_ok, _ = process_status1(store, today, serverStatus, "Server")
        ind_backup_ok, ind_backup_not_ok, _ = process_status1(store, today, IndStoreBackup, "Ind Store Backup")
        acronics_ok, acronics_not_ok, _ = process_status1(store, today, AcronicsBackup, "Acronics Backup")
        sales_ok, sales_not_ok, _ = process_status1(store, yesterday, SaleStatus, "Sales Status")
        pos_backup_ok, pos_backup_not_ok, _ = process_status1(store, today, PosDbBackup, "POS DB Backup")
        plu2_status = process_status_plu2(store, yesterday)

        pos_overall_status = process_status2(store, today, POSStatus, "POS")
        scale_overall_status = process_status2(store, today, ScaleStatus, "Scale")
        pdt_overall_status = process_status2(store, today, PDTStatus, "PDT")
        ups_overall_status = process_status2(store, today, UPSStatus, "UPS")
        server_overall_status = process_status2(store, today, serverStatus, "Server")
        ind_backup_overall_status = process_status2(store, today, IndStoreBackup, "Ind Store Backup")
        acronics_overall_status = process_status2(store, today, AcronicsBackup, "Acronics Backup")
        sales_overall_status = process_status2(store, yesterday, SaleStatus, "Sales Status")

        def exists_and_verified(obj_list):
            count = len(obj_list)
            verified_count = sum(1 for o in obj_list if getattr(o, "verified", False))
            status = "✔️" if count > 0 else "❌"
            verified = "✔️" if verified_count > 0 else "❌"
            return status, verified, count, verified_count

        # Final dict
        return {
            "store": storecode,
            "storename": store.storename,
            **sale_posting_data,
            "plu2_status": "✔️" if plu2 else "❌",
            "plu2_verified": "✔️" if any(getattr(o, "verified", False) for o in plu2) else "❌",
            "plu2Status": plu2_status["plu2Status"],
            "eodStatus": plu2_status["eodStatus"],
            "idocFileStatus": plu2_status["idocFileStatus"],
            "folderStatus": plu2_status["folderStatus"],
            "plu2_count": len(plu2),
            "plu2_verified_count": sum(1 for o in plu2 if getattr(o, "verified", False)),

            **{f"sale_{k}": v for k, v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(sale)
            )},
            **{f"pos_status_{k}": v for k, v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(pos_status)
            )},
            **{f"pdt_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(pdt_status)
            )},
            **{f"scale_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(scale_status)
            )},
            **{f"server_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(server_status)
            )},
            **{f"ups_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(ups_status)
            )},
            **{f"pos_performance_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(pos_performance)
            )},
            **{f"pos_backup_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(pos_backup)
            )},
            **{f"zvchr_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(zvchr_status)
            )},
            **{f"sale_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(sale_status)
            )},
            **{f"acronics_backup_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(acronics_backup)
            )},
            **{f"ind_store_backup_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(ind_store_backup)
            )},
            **{f"server_storage_status_{k}": v for k,v in zip(
                ["status", "verified", "count", "verified_count"], exists_and_verified(server_storage)
            )},
            
            "pos_ok": pos_ok, "pos_not_ok": pos_not_ok, "pos_not_ok_details": pos_not_ok_details,
            "scale_ok": scale_ok, "scale_not_ok": scale_not_ok,
            "pdt_ok": pdt_ok, "pdt_not_ok": pdt_not_ok,
            "ups_ok": ups_ok, "ups_not_ok": ups_not_ok,
            "server_ok": server_ok, "server_not_ok": server_not_ok,
            "ind_backup_ok": ind_backup_ok, "ind_backup_not_ok": ind_backup_not_ok,
            "acronics_ok": acronics_ok, "acronics_not_ok": acronics_not_ok,
            "sales_ok": sales_ok, "sales_not_ok": sales_not_ok,
            "pos_backup_ok": pos_backup_ok, "pos_backup_not_ok": pos_backup_not_ok,
            "pos_overall_status": pos_overall_status,
            "scale_overall_status": scale_overall_status,
            "pdt_overall_status": pdt_overall_status,
            "ups_overall_status": ups_overall_status,
            "server_overall_status": server_overall_status,
            "ind_backup_overall_status": ind_backup_overall_status,
            "acronics_overall_status": acronics_overall_status,
            "sales_overall_status": sales_overall_status,
        }

    def get(self, request):
        today = now().date()
        yesterday = today - timedelta(days=1)

        stores = Store.objects.exclude(storecode="9000")
        store_codes = [s.storecode for s in stores]
        store_dict = {s.storecode: s for s in stores}

        maps = self.get_queryset_maps(store_codes, today, yesterday)

        data = [self.build_store_data(store_dict[code], code, maps, today, yesterday)
                for code in store_codes]

        return JsonResponse({"data": data}, safe=False)

def log_action(view_name, action, user, details, related_object=None):
    ActionLog.objects.create(
        view_name=view_name,
        action=action,
        user=user,
        timestamp=now(),
        details=details,
        related_object=related_object
    )

@csrf_exempt
def ldap_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            required_groups = {
                'Front_Desk_User': 'CN=OPT_Front_Desk_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local',
                'Admin_User': 'CN=OPT_Admin_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local',
                'Management_User': 'CN=OPT_Management_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local',
                'End_User':'CN=OPT_End_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local',
                #'Management_User':'CN=OPT_Admin_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local',
                #'Admin_User': 'CN=OPT_Management_User,OU=Groups,OU=LULUGROUPINDIA,DC=lulugroupindia,DC=local'
            }

            
            LDAP_SERVER = 'ldap://10.4.154.10'
            LDAP_ADMIN_USER = 'glpidevuser'
            LDAP_ADMIN_PASSWORD = 'lulu@1234'
            BASE_DN = 'DC=lulugroupindia,DC=local'

            server = Server(LDAP_SERVER, get_info=ALL)
            conn = Connection(server, user=LDAP_ADMIN_USER, password=LDAP_ADMIN_PASSWORD)

            if not conn.bind():
                log_action('ldap_login', 'FETCH', 'system', {'error': 'Failed to bind to LDAP server', 'username': username})
                return HttpResponse('Failed to bind to LDAP server', status=500)

            search_filter = f'(&(objectClass=user)(sAMAccountName={username}))'
            conn.search(BASE_DN, search_filter, SUBTREE, attributes=['cn', 'mail', 'memberOf', 'sAMAccountName', 'userPrincipalName'])

            if conn.entries:
                user_entry = conn.entries[0]
                user_ldap_dn = user_entry.entry_dn 
                groups = user_entry.memberOf.values if 'memberOf' in user_entry else []

                is_member_of_required_group = None
                user_group = None
                for group_name, group_dn in required_groups.items():
                    if group_dn in groups:
                        is_member_of_required_group = True
                        user_group = group_name  
                        break

                if not is_member_of_required_group:
                    log_action('ldap_login', 'Login Attempt', username, {'error': 'User not in any required group', 'username': username})
                    return HttpResponse('User not in any required group', status=403)

                user_conn = Connection(server, user=user_ldap_dn, password=password)

                if user_conn.bind():
                    log_action('ldap_login', 'Login', username, {'status': 'Authenticated', 'username': username})
                    if 'sAMAccountName' in user_entry:
                        userid = user_entry.sAMAccountName.value
                    elif 'userPrincipalName' in user_entry:
                        user_principal_name = user_entry.userPrincipalName.value
                        userid = re.sub(r'\D', '', user_principal_name.split('@')[0])
                    else:
                        userid = None
                    return JsonResponse({
                        'userid': userid,
                        'username': user_entry.cn.value,
                        'status': 'Authenticated',
                        'userGroup': user_group 
                    }, status=200)
                else:
                    log_action('ldap_login', 'Login Attempt', username, {'error': 'Invalid password', 'username': username})
                    return HttpResponse('Invalid password', status=401)

            log_action('ldap_login', 'Login Attempt', 'system', {'error': 'User not found', 'username': username})
            return HttpResponse('User not found', status=400)

        except json.JSONDecodeError:
            log_action('ldap_login', 'Login Attempt', 'system', {'error': 'Invalid JSON body'})
            return HttpResponse('Invalid JSON body', status=400)

    log_action('ldap_login', 'Login Attempt', 'system', {'error': 'Method not allowed'})
    return HttpResponse('Only POST method is allowed', status=405)

class PLU2ChecklistView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='PLU2Checklist').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('PLU2Checklist', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date if start_date else None,
            'enddate': end_date if end_date else None, 'store': store })
        if action == "PDF":
            log_action('PLU2Checklist', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date if start_date else None,
            'enddate': end_date if end_date else None, 'store': store})    
            
        queryset = PLU2Checklist.objects.all()
        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
                
        sql_query = str(queryset.query)
        log_action('PLU2Checklist', 'FETCH', username or request.user.username, {'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store, "query": sql_query})  
        if format_type == 'csv':
            log_action('PLU2Checklist', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('PLU2Checklist', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_pdf(queryset)
        
        serializer = PLU2ChecklistSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="plu2_checklist.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name' , 'PLU2 Status', 'PLU2 Containing Folder', 'EOD Final Status', 'IDOC File Upload Status', 'ZREAD', 'Customer Count', 'Remarks'])
        for checklist in queryset:
            writer.writerow([checklist.date, checklist.store, checklist.storename, checklist.plu2Status, checklist.folderStatus, checklist.eodStatus, 
                             checklist.idocFileStatus, checklist.zread, checklist.customercount, checklist.remarks])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="plu2_checklist.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "PLU2 Status")
        p.drawString(500, 750, "PLU2 Containing Folder")
        p.drawString(600, 750, "EOD Final Status")
        p.drawString(700, 750, "IDOC File Status")
        p.drawString(800, 750, "ZREAD")
        p.drawString(900, 750, "Customer Count")
        p.drawString(1000, 750, "Remarks")

        y_position = 730
        for checklist in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(checklist.date))
            p.drawString(200, y_position, str(checklist.store))
            p.drawString(300, y_position, str(checklist.storename))
            p.drawString(400, y_position, str(checklist.plu2Status))
            p.drawString(500, y_position, str(checklist.folderStatus))
            p.drawString(600, y_position, str(checklist.eodStatus))
            p.drawString(700, y_position, str(checklist.idocFileStatus))
            p.drawString(800, y_position, str(checklist.zread))
            p.drawString(900, y_position, str(checklist.customercount))
            p.drawString(1000, y_position, str(checklist.remarks))

            if y_position < 50:  
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def post(self, request):
        serializer = PLU2ChecklistSerializer(data=request.data)
        if serializer.is_valid():
            store = request.data.get('store')
            date = request.data.get('date')
            user = request.data.get('user')  
            if PLU2Checklist.objects.filter(store=store, date=date, verified=1).exists():
                return Response({"detail": "Entry with this store and date already exists."}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            log_action('PLU2Checklist', 'CREATE', user, {
                'status': 'Entry created', 'store': store, 'date': date, 'details': request.data
            })
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)
        
        print()
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = PLU2Checklist.objects.get(pk=pk)
            except PLU2Checklist.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = PLU2ChecklistSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PLU2Checklist', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = PLU2ChecklistSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PLU2Checklist', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = PLU2ChecklistSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PLU2Checklist', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = PLU2ChecklistSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('PLU2Checklist', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = PLU2Checklist.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('PLU2Checklist', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):
        try:
            checklist = PLU2Checklist.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('PLU2Checklist', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except PLU2Checklist.DoesNotExist:
            user = request.data.get('user', request.user.username) 
            log_action('PLU2Checklist', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

class SalePostingView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='SalePosting').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        username = request.query_params.get('user', None) 
        action = request.query_params.get('action', None)  
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('SalePosting', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date if start_date else None,
                                'enddate': end_date if end_date else None, 'store': store})
        if action == "PDF":
           log_action('SalePosting', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
               
        
        queryset = SalePosting.objects.all()
        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
            
        sql_query = str(queryset.query)
        log_action('SalePosting', 'FETCH', username or request.user.username, {'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store, "query": sql_query})          
        
        if format_type == 'csv':
            log_action('SalePosting', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('SalePosting', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_pdf(queryset)

        serializer = SalePostingSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sale_posting.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['ID', 'Store', 'Store Name', 'Date', 'Total Payment', 'Expected Payment', 'Actual Payment',
                         'Cashier Short Excess', 'ZDSR', 'ZRead', 'ZDSR ZRead', 
                         'ZPMC', 'Difference', 'Total Article Sale', 'Exception', 'Remarks'])
        for posting in queryset:
            writer.writerow([posting.id, posting.store, posting.storename, posting.date, posting.totalpayment, posting.expectedpayment, 
                             posting.actualpayment, posting.cashiershortexcess, posting.zdsr, posting.zread, 
                             posting.zdsrzread, posting.zpmc, posting.difference, 
                             posting.totalarticlesale, posting.exception, posting.remarks if posting.remarks else ""])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="sale_posting.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "ID")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Date")
        p.drawString(500, 750, "Total Payment")
        p.drawString(600, 750, "Expected Payment")
        p.drawString(700, 750, "Actual Payment")
        p.drawString(800, 750, "Cashier Short Excess")
        p.drawString(900, 750, "ZDSR")
        p.drawString(1000, 750, "ZRead")
        p.drawString(1100, 750, "ZDSR ZRead")
        p.drawString(1200, 750, "ZPMC")
        p.drawString(1300, 750, "Difference")
        p.drawString(1400, 750, "Total Article Sale")
        p.drawString(1500, 750, "Exception")
        p.drawString(1600, 750, "Remarks")

        y_position = 730
        for posting in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(posting.id))
            p.drawString(200, y_position, str(posting.store))
            p.drawString(300, y_position, str(posting.storename))
            p.drawString(400, y_position, str(posting.date))
            p.drawString(500, y_position, str(posting.totalpayment))
            p.drawString(600, y_position, str(posting.expectedpayment))
            p.drawString(700, y_position, str(posting.actualpayment))
            p.drawString(800, y_position, str(posting.cashiershortexcess))
            p.drawString(900, y_position, str(posting.zdsr))
            p.drawString(1000, y_position, str(posting.zread))
            p.drawString(1100, y_position, str(posting.zdsrzread))
            p.drawString(1200, y_position, str(posting.zpmc))
            p.drawString(1300, y_position, str(posting.difference))
            p.drawString(1400, y_position, str(posting.totalarticlesale))
            p.drawString(1500, y_position, str(posting.exception))
            p.drawString(1600, y_position, str(posting.remarks if posting.remarks else ""))
            
            if y_position < 50:  # Start a new page if the content exceeds the page length
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_entry = SalePosting.objects.filter(date=date, store=store).first()
        if existing_entry:
            serializer = SalePostingSerializer(existing_entry, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                log_action('SalePosting', 'CREATE', user, { 'status': 'Entry created', 'store': store, 'date': date, 'details': request.data})
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SalePostingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        # Get the list of authorized stores for the user
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        # Handle single record verification
        if pk:
            try:
                instance = SalePosting.objects.get(pk=pk)
            except SalePosting.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if the record is verified and if the user is authorized
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            # If the store is not authorized and 'verified' is False, proceed with the update
            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = SalePostingSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SalePosting', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # If the store is authorized and 'verified' is True, update with verified status
            if instance.store not in  authorized_stores and request.data.get('verified', False):
                serializer = SalePostingSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SalePosting', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = SalePostingSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SalePosting', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = SalePostingSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('SalePosting', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = SalePosting.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('SalePosting', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):
        try:
            instance = SalePosting.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('SalePosting', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except SalePosting.DoesNotExist:
            user = request.data.get('user', request.user.username)  # In case of error, use the username as well
            log_action('SalePosting', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)
    
LDAP_SERVER = 'ldap://10.4.154.10'
LDAP_ADMIN_USER = 'glpidevuser'
LDAP_ADMIN_PASSWORD = 'lulu@1234'
BASE_DN = 'DC=lulugroupindia,DC=local'

def get_employee_name(employee_id): 
    server = Server(LDAP_SERVER)
    conn = Connection(server, user=LDAP_ADMIN_USER, password=LDAP_ADMIN_PASSWORD, auto_bind=True)

    search_filter = f'(&(objectClass=user)(sAMAccountName={employee_id}))'
    conn.search(BASE_DN, search_filter, SUBTREE, attributes=['cn'])

    if conn.entries:
        return conn.entries[0].cn.value  
    return None    
    
class StoreView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='store').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        storecode = request.query_params.get('store')
        
        if storecode and storecode!= 'None':
            filters = {}
            if storecode:
                filters['storecode'] = storecode
            entries = Store.objects.filter(**filters)
        else:
            entries = Store.objects.all()

        serializer = StoreSerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        storecode = request.data.get('storecode')
        storename = request.data.get('storename')
        itmanager_id = request.data.get('itmanager')
        itincharge_id = request.data.get('itincharge')
        assitincharge_id = request.data.get('assitincharge')

        if not storename or not storecode:
            return Response({"detail": "Store code and store name are required."}, status=status.HTTP_400_BAD_REQUEST)

        itmanager_name = get_employee_name(itmanager_id) if itmanager_id else None
        itincharge_name = get_employee_name(itincharge_id) if itincharge_id else None
        assitincharge_name = get_employee_name(assitincharge_id) if assitincharge_id else None

        updated_data = request.data.copy()
        updated_data['itmanager'] = itmanager_name or itmanager_id
        updated_data['itincharge'] = itincharge_name or itincharge_id
        updated_data['assitincharge'] = assitincharge_name or assitincharge_id

        existing_entry = Store.objects.filter(storecode=storecode, storename=storename).first()
        if existing_entry:
            serializer = StoreSerializer(existing_entry, data=updated_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = StoreSerializer(data=updated_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk=None):
        if not pk:
            return Response({"detail": "ID is required for update."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance = Store.objects.get(pk=pk)
        except Store.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        updated_data = request.data.copy()
        updated_data['itmanager'] = get_employee_name(request.data.get('itmanager')) or request.data.get('itmanager')
        updated_data['itincharge'] = get_employee_name(request.data.get('itincharge')) or request.data.get('itincharge')
        updated_data['assitincharge'] = get_employee_name(request.data.get('assitincharge')) or request.data.get('assitincharge')
        
        serializer = StoreSerializer(instance, data=updated_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            user = request.data.get('user', request.user.username) 
            instance = Store.objects.get(pk=pk)
            instance.delete()
            log_action('Store', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except Store.DoesNotExist:
            user = request.data.get('user', request.user.username)
            log_action('Store', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)
     
class ADUserStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='ADUserStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('ADUserStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date if start_date else None,
            'enddate': end_date if end_date else None, 'store': store })
        if action == "PDF":
            log_action('ADUserStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date if start_date else None,
            'enddate': end_date if end_date else None, 'store': store})    
            
                
        queryset = ADUserStatus.objects.all()
        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store:
            queryset = queryset.filter(store=store)

        for item in queryset:
            file_name = f"{item.name}_{item.userlogonname}_{item.statuschange}_{item.store}_{item.date}.pdf"
            file_path = os.path.join(settings.MEDIA_URL, 'AD_User_List', file_name)

            full_file_path = os.path.join(settings.MEDIA_ROOT, 'AD_User_List', file_name)
            if os.path.exists(full_file_path):
                item.fileurl = request.build_absolute_uri(file_path)
            else:
                item.fileurl = None
        sql_query = str(queryset.query)
        log_action('ADUserStatus', 'FETCH', username or request.user.username, {'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store, "query": sql_query})  

        serializer = ADUserStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ad_user_list.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name', 'Name', 'Status Change', 'Account Type', 'User Logon Name', 'Account Status', 'Ticket No', 'Ticket Status', 'Remarks'])
        for user in queryset:
            writer.writerow([
                user.date,
                user.store,
                user.storename,
                user.name,
                user.statuschange,
                user.accounttype,
                user.userlogonname,
                user.accountstatus,
                user.ticketno if user.ticketno else "",
                user.ticketstatus,
                user.remarks if user.remarks else "",
            ])

        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="ad_user_list.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Name")
        p.drawString(500, 750, "Status Change")
        p.drawString(600, 750, "Account Type")
        p.drawString(700, 750, "User Logon Name")
        p.drawString(800, 750, "Account Status")
        p.drawString(900, 750, "Ticket No")
        p.drawString(1000, 750, "Ticket Status")
        p.drawString(1100, 750, "Remarks")

        y_position = 730
        for user in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(user.date))
            p.drawString(200, y_position, str(user.store))
            p.drawString(300, y_position, str(user.storename))
            p.drawString(400, y_position, str(user.name))
            p.drawString(500, y_position, str(user.statuschange))
            p.drawString(600, y_position, str(user.accounttype))
            p.drawString(700, y_position, str(user.userlogonname))
            p.drawString(800, y_position, str(user.accountstatus))
            p.drawString(900, y_position, str(user.ticketno))
            p.drawString(1000, y_position, str(user.ticketstatus))
            p.drawString(1100, y_position, str(user.remarks))

            if y_position < 50: 
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        user_data = request.data.get('user_data')
        user_data = json.loads(user_data) if user_data else {}
        file = request.FILES.get('file')
        store = user_data.get('store')
        date = user_data.get('date')
        user = user_data.get('user')
        name = user_data.get('name')
        statuschange = user_data.get('statuschange')
        userlogonname = user_data.get('userlogonname')

        filename = None

        if file:
            file_extension = file.name.split('.')[-1].lower()

            custom_file_name = f"{name}_{userlogonname}_{statuschange}_{store}_{date}.pdf"

            if file_extension == 'pdf':
                file_path = os.path.join(settings.MEDIA_ROOT, 'AD_User_List', custom_file_name)
                with open(file_path, 'wb') as f:
                    for chunk in file.chunks():
                        f.write(chunk)
                filename = custom_file_name  # Save the filename

            elif file_extension in ['png', 'jpeg']:
                img = Image.open(file)
                pdf_page_size = (1200, 800)  
                img = ImageOps.contain(img, pdf_page_size) 
                img_pdf = BytesIO()
                img.convert('RGB').save(img_pdf, format='PDF')
                img_pdf.seek(0)

                pdf_writer = PdfWriter()
                pdf_reader = PdfReader(img_pdf)
                pdf_writer.add_page(pdf_reader.pages[0])

                pdf_file_path = os.path.join(settings.MEDIA_ROOT, 'AD_User_List', custom_file_name)
                with open(pdf_file_path, 'wb') as f:
                    pdf_writer.write(f)
                filename = custom_file_name  

        if filename:
            user_data['filename'] = filename

        existing_entry = ADUserStatus.objects.filter(
                date=date,
                store=store,
                userlogonname=userlogonname
            ).first()

        if existing_entry:
            serializer = ADUserStatusSerializer(existing_entry, data=user_data, partial=True)
            if serializer.is_valid():
                updated_entry = serializer.save(verified=False, verifiedby=None)
                log_action("ADUserStatus", "UPDATE", user, user_data, updated_entry.id)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            serializer = ADUserStatusSerializer(data=user_data)
            if serializer.is_valid():
                new_entry = serializer.save()
                log_action("ADUserStatus", "CREATE", user, user_data, new_entry.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = ADUserStatus.objects.get(pk=pk)
            except ADUserStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # If user is not authorized for the store and trying to verify
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            # Handle the scenario where the store is not authorized but verification is not requested
            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = ADUserStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ADUserStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle case where verification is requested but the store is not authorized
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = ADUserStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ADUserStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle case where the store is authorized and no verification is requested
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = ADUserStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ADUserStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # If verification is requested and store is authorized
            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = ADUserStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('ADUserStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        # Handle bulk record verification
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Only update records for stores the user is authorized for
        updated = ADUserStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('ADUserStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, id):
        try:
            ad_user = ADUserStatus.objects.get(id=id)
            user = request.data.get('user', request.user.username)
            
            if ad_user.filename:
                file_path = os.path.join(settings.MEDIA_ROOT, 'AD_User_List', ad_user.filename)
                if os.path.exists(file_path):
                    os.remove(file_path) 
                else:
                    print(f"File {ad_user.filename} not found.")  

            ad_user.delete()

            log_action('ADUserStatus', 'DELETE', user, {'status': 'Deleted', 'id': id})
            return Response({'message': 'Record and file deleted successfully!'}, status=status.HTTP_200_OK)

        except ADUserStatus.DoesNotExist:
            log_action('ADUserStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
class GovernanceReportUpload(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # Extract data from request
        store = request.data.get('store')
        month = request.data.get('month')
        file = request.FILES.get('file')
        year = request.data.get('year', str(datetime.now().year))  # Default to current year if not provided

        # Validate required fields
        if not store or not month:
            return Response({
                "error": "Missing required fields: store and month",
                "received_store": store,
                "received_month": month
            }, status=status.HTTP_400_BAD_REQUEST)

        if not file:
            return Response({"error": "File not provided or missing"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        file_extension = file.name.split('.')[-1].lower()
        valid_extensions = ['pdf', 'doc', 'docx', 'xlsx']
        if file_extension not in valid_extensions:
            return Response({"error": f"Invalid file type: .{file_extension}"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate file name and path
        file_name = f"{store}_Governance_Report_{month}_{year}.{file_extension}"
        month_folder_path = os.path.join(settings.MEDIA_ROOT, 'Governance_Report', month)
        file_path = os.path.join(month_folder_path, file_name)

        # Remove any existing files for the same store and month
#        existing_files = glob.glob(os.path.join(month_folder_path, f"{store}_Governance_Report_*"))
#        for existing_file in existing_files:
#            os.remove(existing_file)

        base_file_name = f"{store}_Governance_Report_{month}_{year}"
        month_folder_path = os.path.join(settings.MEDIA_ROOT, 'Governance_Report', month)

        # Check if a file with the same base name but any extension already exists
        existing_files = glob.glob(os.path.join(month_folder_path, f"{base_file_name}.*"))
        if existing_files:
            return Response({
                "error": "File with the same name already exists.",
                "existing_files": [os.path.basename(f) for f in existing_files]
            }, status=status.HTTP_409_CONFLICT) 
            
        os.makedirs(month_folder_path, exist_ok=True)

        # Save the file
        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Generate the accessible file URL
        file_url = os.path.join('media', 'Governance_Report', month, file_name)

        # Return response
        return Response({
            "message": "File uploaded successfully!",
            "file_url": file_url
        }, status=status.HTTP_200_OK)
        
    def get(self, request, *args, **kwargs):
        store = request.query_params.get('store')
        month = request.query_params.get('month')
        year = request.query_params.get('year') 
        
        download_zip = request.query_params.get('download_zip', 'false').lower() == 'true'
        if not year:
            return Response({"error": "Year is required"}, status=status.HTTP_400_BAD_REQUEST)

        base_path = os.path.join(settings.MEDIA_ROOT, 'Governance_Report')
        result = []
        if store and store != "None" and month and month != "None":
            # If both store and month are specified, look for the specific report
            file_name = f"{store}_Governance_Report_{month}_{year}.*"
            search_path = os.path.join(base_path, month, file_name)
            result.extend(glob.glob(search_path))
        elif store and store != "None" and not month:
            # If only store is specified, look through all months for that store and year
            for month_folder in os.listdir(base_path):
                search_path = os.path.join(base_path, month_folder, f"{store}_Governance_Report_*_{year}.*")
                result.extend(glob.glob(search_path))
        elif month and month != "None":
            # If only month is specified, look for reports across all stores for the specified month and year
            search_path = os.path.join(base_path, month, f"*_{year}.*")
            result.extend(glob.glob(search_path))
        else:
            # If no month or store is specified, look for all reports for the specified year
            search_path = os.path.join(base_path, '*', f"*_{year}.*")
            result.extend(glob.glob(search_path))
            
        files = []
        for file in result:
            files.append({
                "file_name": os.path.basename(file),
                "file_url": f"/media/{os.path.relpath(file, settings.MEDIA_ROOT)}",
            })
        
        if download_zip and files:
            # Handle downloading reports as a ZIP file
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for file in result:
                    zip_file.write(file, os.path.basename(file))
            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.read(), content_type="application/zip")
            response['Content-Disposition'] = 'attachment; filename=Governance_Reports.zip'
            return response

        return Response(files, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        file_url = data.get('file_url')
        
        if not file_url:
            return Response({"error": "file_url is required"}, status=400)
        
        file_url = file_url.replace("\\", "/")  
        file_parts = file_url.split("/")
        file_name = file_parts[-1] 
        
        if len(file_parts) >= 3:  
            year = file_name.split("_")[-1].split(".")[0]  
            month = file_parts[-2]  
        else:
            return Response({"error": "Invalid file structure"}, status=400)
        
        file_path = os.path.join(settings.MEDIA_ROOT, 'Governance_Report', month, file_name) 
        if os.path.exists(file_path):
            os.remove(file_path)
            return Response({"message": "File deleted successfully"}, status=200)
        else:
            return Response({"error": "File not found"}, status=404)

class PosDbBackupView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='PosDbBackup').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('PosDbBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
        if action == "PDF":
            log_action('PosDbBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
        

        queryset = PosDbBackup.objects.all()
        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        
        sql_query = str(queryset.query) 
        log_action('PosDbBackup', 'FETCH', username or request.user.username, {'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('PosDbBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('PosDbBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_pdf(queryset)

        serializer = PosDbBackupSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="pos_db_backup.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name', 'File Name', 'Size', 'Backup Date', 'Remarks'])
        for backup in queryset:
            writer.writerow([ backup.date, backup.store, backup.storename, backup.filename, backup.size, 
                             backup.datebackup, backup.remarks if backup.remarks else ""])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="pos_db_backup.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "File Name")
        p.drawString(500, 750, "Size")
        p.drawString(600, 750, "Backup Date")
        p.drawString(700, 750, "Remarks")

        y_position = 730
        for backup in queryset:
            y_position -= 20
            p.drawString(300, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.filename))
            p.drawString(500, y_position, str(backup.size))
            p.drawString(600, y_position, str(backup.datebackup))
            p.drawString(700, y_position, str(backup.remarks or ""))
            
            if y_position < 50:  
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'filename': file.get('filename'),
                'datebackup': file.get('datebackup'),
                'size': file.get('size'),
                'remarks': request.data.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
                'verified': False,
                'verifiedby':None
            }

            existing_entry = PosDbBackup.objects.filter(
                date=date,
                store=store,
                storename=storename,
                filename=file.get('filename'),
                remarks=request.data.get('remarks'),
            ).first()

            if existing_entry:
                serializer = PosDbBackupSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("PosDbBackup", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = PosDbBackupSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("PosDbBackup","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(PosDbBackupSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True)| Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = PosDbBackup.objects.get(pk=pk)
            except PosDbBackup.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = PosDbBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PosDbBackup', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = PosDbBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PosDbBackup', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = PosDbBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PosDbBackup', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = PosDbBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('PosDbBackup', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)


        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)
        updated = PosDbBackup.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        if updated > 0:
            log_action("PosDbBackup", "VERIFIED", user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            instance = PosDbBackup.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('PosDbBackup', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except PosDbBackup.DoesNotExist:
            log_action('PosDbBackup', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)

class ZvchrStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='ZvchrStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('ZvchrStatus', 'DOWNLOAD', username or request.user.username , {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('ZvchrStatus', 'DOWNLOAD', username or request.user.username , {'format': 'pdf', 'date': date, 'store': store})
            
        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = ZvchrStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        
        sql_query = str(queryset.query) 
        log_action('ZvchrStatus', 'FETCH',username or request.user.username, {'date': date, 'store': store, "query": sql_query })
    
        if format_type == 'csv':
            log_action('ZvchrStatus', 'DOWNLOAD', username or request.user.username , {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('ZvchrStatus', 'DOWNLOAD', username or request.user.username , {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)
        
        serializer = ZvchrStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="zvchr_status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name', 'PTER', 'PTES', 'PTVR', 'PTVS', 'ZQER', 'ZQGR', 'ZQGS', 'Remarks'])
        for item in queryset:
            writer.writerow([
                item.date, item.store,  item.storename, item.pter, item.ptes, item.ptvr, item.ptvs,
                item.zqer, item.zqgr, item.zqgs, item.remarks
            ])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="zvchr_status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        headers = ['Date', 'Store', 'Store Name', 'PTER', 'PTES', 'PTVR', 'PTVS', 'ZQER', 'ZQGR', 'ZQGS', 'Remarks']
        x_positions = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550]
        for idx, header in enumerate(headers):
            p.drawString(x_positions[idx], 750, header)
        
        y_position = 730
        for item in queryset:
            y_position -= 20
            p.drawString(50, y_position, str(item.date))
            p.drawString(100, y_position, str(item.store))
            p.drawString(150, y_position, str(item.storename))
            p.drawString(200, y_position, str(item.pter))
            p.drawString(250, y_position, str(item.ptes))
            p.drawString(300, y_position, str(item.ptvr))
            p.drawString(350, y_position, str(item.ptvs))
            p.drawString(400, y_position, str(item.zqer))
            p.drawString(450, y_position, str(item.zqgr))
            p.drawString(500, y_position, str(item.zqgs))
            p.drawString(550, y_position, str(item.remarks))
            
            if y_position < 50: 
                p.showPage()
                y_position = 750
        
        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def post(self, request):
        serializer = ZvchrStatusSerializer(data=request.data)
        if serializer.is_valid():
            store = request.data.get('store')
            date = request.data.get('date')
            user = request.data.get('user')  
            
            if ZvchrStatus.objects.filter(store=store, date=date).exists():
                return Response({"detail": "Entry with this store and date already exists."}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            log_action('ZvchrStatus', 'CREATE', user, {'status': 'Entry created', 'store': store, 'date': date,  'detail':request.data})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        # Fetch authorized stores where the user has roles like itincharge, assitincharge, itmanager, admin_manager, or cio
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            # Handle single record verification
            try:
                instance = ZvchrStatus.objects.get(pk=pk)
            except ZvchrStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure the user is authorized for the store linked to this record
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                # If store is not authorized and not marked as verified, update other fields
                serializer = ZvchrStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ZvchrStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = ZvchrStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ZvchrStatus', 'UPDATE', user, {'status': 'Verified', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                # If store is authorized and verified is set to True, mark as verified
                serializer = ZvchrStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ZvchrStatus', 'UPDATE', user, {'status': 'Verified', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


            if request.data.get('verified', False) and instance.store in authorized_stores:
                 # If store is authorized and verified is set to True, mark as verified
                serializer = ZvchrStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('ZvchrStatus', 'UPDATE', user, {'status': 'Verified', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                
        # Handle bulk record verification
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Only update records for stores the user is authorized for
        updated = ZvchrStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('ZvchrStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
        
    def delete(self, request, pk):
        try:
            instance = ZvchrStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('ZvchrStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except ZvchrStatus.DoesNotExist:
            log_action('ZvchrStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        
class SaleStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='SaleStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None) 
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('SaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('SaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            
        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = SaleStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
           
        sql_query = str(queryset.query) 
        log_action('SaleStatus', 'FETCH',  username or request.user.username, {'date': date, 'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('SaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('SaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)
        
        serializer = SaleStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="sale_status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name' , 'ZDSR', 'ZCASR', 'ZREAD', 'ZPMC', 'Remarks'])
        for item in queryset:
            writer.writerow([item.date, item.store, item.storename, item.zdsr, item.zcasr, item.zread, item.zpmc, item.remarks])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="sale_status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        headers = ['Date', 'Store', 'Store Name' , 'ZDSR', 'ZCASR', 'ZREAD', 'ZPMC', 'Remarks']
        x_positions = [50, 100, 150, 200, 250, 300, 350, 400]
        for idx, header in enumerate(headers):
            p.drawString(x_positions[idx], 750, header)
        
        y_position = 730
        for item in queryset:
            y_position -= 20
            p.drawString(50, y_position, str(item.date))
            p.drawString(100, y_position, str(item.store))
            p.drawString(150, y_position, str(item.storename))
            p.drawString(200, y_position, str(item.zdsr))
            p.drawString(250, y_position, str(item.zcasr))
            p.drawString(300, y_position, str(item.zread))
            p.drawString(350, y_position, str(item.zpmc))
            p.drawString(400, y_position, str(item.remarks))
            
            if y_position < 50:
                p.showPage()
                y_position = 750
        
        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def post(self, request):
        serializer = SaleStatusSerializer(data=request.data)
        if serializer.is_valid():
            store = request.data.get('store')
            date = request.data.get('date')
            user = request.data.get('user')  
            if SaleStatus.objects.filter(store=store, date=date).exists():
                return Response({"detail": "Entry with this store and date already exists."}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save()
            log_action('SaleStatus', 'CREATE', user, {
                'status': 'Entry created', 'store': store, 'date': date, 'details': request.data
            })
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        # Fetch authorized stores where the user has roles like itincharge, assitincharge, itmanager, admin_manager, or cio
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = SaleStatus.objects.get(pk=pk)
            except SaleStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # Ensure the user is authorized for the store linked to this record
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = SaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = SaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = SaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('SaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = SaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('SaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        # Handle bulk record verification
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Only update records for stores the user is authorized for
        updated = SaleStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('SaleStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            instance = SaleStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('SaleStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except SaleStatus.DoesNotExist:
            log_action('SaleStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
      
class AcronicsBackupView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='AcronicsBackup').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None)
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('AcronicsBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('AcronicsBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})

        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = AcronicsBackup.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
           
        sql_query = str(queryset.query) 
        log_action('AcronicsBackup', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('AcronicsBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('AcronicsBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = AcronicsBackupSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="acronics_backup.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name' , 'Server Name', 'TPCentralDB', 'TPCMDB', 'Remarks', 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.servername, 
                             backup.tpcentraldb, backup.tpcmdb, backup.remarks or "", backup.submitted_time])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="acronics_backup.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Server Name")
        p.drawString(500, 750, "TPCentralDB")
        p.drawString(600, 750, "TPCMDB")
        p.drawString(700, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.servername))
            p.drawString(500, y_position, str(backup.tpcentraldb))
            p.drawString(600, y_position, str(backup.tpcmdb))
            p.drawString(700, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,                
                'servername': file.get('servername'),
                'tpcentraldb': file.get('tpcentraldb'),
                'tpcmdb': file.get('tpcmdb'),
                'remarks': request.data.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = AcronicsBackup.objects.filter(
                date=date,
                store=store,
                storename=storename,
                servername=file.get('servername')
            ).first()

            if existing_entry:
                serializer = AcronicsBackupSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("AcronicsBackup", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = AcronicsBackupSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("AcronicsBackup","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(AcronicsBackupSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        # Fetch authorized stores where the user has roles like itincharge, assitincharge, itmanager, admin_manager, or cio
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                # Fetch the instance based on pk
                instance = AcronicsBackup.objects.get(pk=pk)
            except AcronicsBackup.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # Handle verification logic
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                # Update without changing verified status
                serializer = AcronicsBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action("AcronicsBackup", "UPDATE", user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                # Update with verified status
                serializer = AcronicsBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action("AcronicsBackup", "UPDATE", user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                # Update without changing verified status
                serializer = AcronicsBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action("AcronicsBackup", "UPDATE", user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = AcronicsBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action("AcronicsBackup", "UPDATE", user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = AcronicsBackup.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action("AcronicsBackup", "VERIFIED", user, {'status': 'Verified', 'ids': ids, 'stores': list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            instance = AcronicsBackup.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('AcronicsBackup', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except AcronicsBackup.DoesNotExist:
            log_action('AcronicsBackup', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        
class IndStoreBackupView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='IndStoreBackup').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('IndStoreBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('IndStoreBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})

        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = IndStoreBackup.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)

        sql_query = str(queryset.query) 
        log_action('IndStoreBackup', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('IndStoreBackup', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('IndStoreBackup', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = IndStoreBackupSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ind_store_backup.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Date", 'Store', 'Store Name', 'Server Name', 'TPCentralDB', 'TPCMDB', 'Remarks', 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.servername, 
                             backup.tpcentraldb, backup.tpcmdb, backup.remarks or "", backup.submitted_time])
            
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="ind_store_backup.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)


        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Server Name")
        p.drawString(500, 750, "TPCentralDB")
        p.drawString(600, 750, "TPCMDB")
        p.drawString(700, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.servername))
            p.drawString(500, y_position, str(backup.tpcentraldb))
            p.drawString(600, y_position, str(backup.tpcmdb))
            p.drawString(700, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'servername': file.get('servername'),
                'tpcentraldb': file.get('tpcentraldb'),
                'tpcmdb': file.get('tpcmdb'),
                'remarks': request.data.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = IndStoreBackup.objects.filter(
                date=date, store=store, storename=storename,
                servername=file.get('servername')
            ).first()

            if existing_entry:
                serializer = IndStoreBackupSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("IndStoreBackup", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = IndStoreBackupSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("IndStoreBackup","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(IndStoreBackupSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = IndStoreBackup.objects.get(pk=pk)
            except IndStoreBackup.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # If verified field is provided, ensure user is authorized for the store
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            # If the store is not authorized and verified flag is not set
            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = IndStoreBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action("IndStoreBackup", "UPDATE", user, {"status": "Updated", "id": pk, "detail": request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # If verified flag is set and store is authorized
            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = IndStoreBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None) # Explicitly mark as verified
                    log_action("IndStoreBackup", "UPDATE", user, {"status": "Verified", "id": pk, "detail": request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = IndStoreBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None) # Explicitly mark as verified
                    log_action("IndStoreBackup", "UPDATE", user, {"status": "Verified", "id": pk, "detail": request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = IndStoreBackupSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action("IndStoreBackup", "UPDATE", user, {"status": "Updated", "id": pk, "detail": request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = IndStoreBackup.objects.filter(id__in=ids, store__in=authorized_stores).update(user=user)
        
        if updated > 0:
            log_action("IndStoreBackup", "VERIFIED", user, {"status": "Verified", "ids": ids, "stores": list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            instance = IndStoreBackup.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('IndStoreBackup', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except IndStoreBackup.DoesNotExist:
            log_action('IndStoreBackup', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)

class ServerStorageView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='ServerStorage').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('ServerStorage', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('ServerStorage', 'DOWNLOAD',  username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})

        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = ServerStorage.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)

        sql_query = str(queryset.query) 
        log_action('ServerStorage', 'FETCH',  username or request.user.username, {'date': date, 'store': store, "query": sql_query })

        if format_type == 'csv':
            log_action('ServerStorage', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('ServerStorage', 'DOWNLOAD',  username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = ServerStorageSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="Server_Storage_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Date", 'Store', 'Store Name',  "Server Name", "Hard Drive", "Total Space (GB)", "Free Space (GB)","Used Space (GB)", "Remarks"])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.servername, backup.harddrive, 
                             backup.totalspace, backup.freespace, backup.usedspace, backup.remarks or "", backup.submitted_time])
        
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Server_Storage_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Server Name")
        p.drawString(500, 750, "Hard Drive")
        p.drawString(600, 750, "Total Space")
        p.drawString(700, 750, "Free Space")
        p.drawString(800, 750, "Used Space")
        p.drawString(900, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.servername))
            p.drawString(500, y_position, str(backup.harddrive))
            p.drawString(600, y_position, str(backup.totalspace))
            p.drawString(700, y_position, str(backup.freespace))
            p.drawString(900, y_position, str(backup.usedspace))
            p.drawString(1000, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  

        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'servername': file.get('servername'),
                'harddrive': file.get('harddrive'),
                'totalspace': file.get('totalspace'),
                'freespace': file.get('freespace'),
                'usedspace': file.get('usedspace'),
                'remarks': request.data.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = ServerStorage.objects.filter(
                date=date, store=store, storename=storename,
                servername=file.get('servername'),
                harddrive=file.get('harddrive'),
                remarks=request.data.get('remarks'),
            ).first()

            if existing_entry:
                serializer = ServerStorageSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("ServerStorage", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = ServerStorageSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("ServerStorage","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(ServerStorageSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = ServerStorage.objects.get(pk=pk)
            except ServerStorage.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = ServerStorageSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ServerStorage', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = ServerStorageSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ServerStorage', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = ServerStorageSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ServerStorage', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = ServerStorageSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('ServerStorage', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = ServerStorage.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action("ServerStorage", "VERIFIED", user, {"status": "Verified", "ids": ids, "Store": list(authorized_stores)})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            instance = ServerStorage.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            instance.delete()
            log_action('ServerStorage', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except ServerStorage.DoesNotExist:
            log_action('ServerStorage', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)

class POSPDTScaleView(APIView):
    def log_action(self, view_name, action, user, details, related_object=None):
        ActionLog(
            view_name=view_name,
            action=action,
            user=user,
            details=details,
            related_object=related_object
        )

    def get(self, request):
        store = request.query_params.get('store')
        section = request.query_params.get('section')
        type = request.query_params.get('type')
        format_type = request.query_params.get('format', 'json')

        if not store:
            return Response({"detail": "store is required."}, status=status.HTTP_400_BAD_REQUEST)

        queryset = POSPDTSCALE.objects.filter(store=store)
        if type:
            queryset = queryset.filter(type=type)  # Filter by type
        if section:
            queryset = queryset.filter(section=section)

        sql_query = str(queryset.query)
        self.log_action(
            view_name="POSPDTScaleView",
            action="FETCH",
            user=request.user.username,
            details={
                "store": store, 
                "type": type, 
                "section": section, 
                "format": format_type,
                "query": sql_query
            },
            related_object=None  
        )
        
        if format_type == 'csv':
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            return self.generate_pdf(queryset)

        serializer = POSPDTSCALESerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="POS_PDT_SCALE_DETAILS.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Store", "Section", "Type", "Number", "Counter Number"])

        for backup in queryset:
            writer.writerow([backup.store, backup.section, backup.type,
                             backup.typenumber, backup.counternumber or ""])
            
        self.log_action(
            view_name = "POSPDTScaleView",
            action = "DOWNLOAD",
            user = request.user.username, 
            details = {"file_format": "csv", "record_count": queryset.count()},
            related_object=None
        )
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="POS_PDT_SCALE_DETAILS.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Store")
        p.drawString(200, 750, "Section")
        p.drawString(300, 750, "Type")
        p.drawString(400, 750, "Number")
        p.drawString(500, 750, "Counter Number")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.store))
            p.drawString(200, y_position, str(backup.section))
            p.drawString(300, y_position, str(backup.type))
            p.drawString(400, y_position, str(backup.typenumber))
            p.drawString(500, y_position, str(backup.counternumber or ""))
            
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        self.log_action(
            view_name="POSPDTScaleView",
            action="DOWNLOAD",
            user=request.user.username,
            details={"file_format": "pdf", "record_count": queryset.count()}
        )
        return response
    
    def post(self, request):
        store = request.data.get('store')
        section = request.data.get('section')
        files = request.data.get('files')

        if not section or not store:
            return Response({"detail": "Store and section are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'store': store,
                'section':section,
                'type': file.get('type'),
                'typenumber': file.get('typenumber'),
                'counternumber': file.get('counternumber'),
                'submitted_time': request.data.get('submitted_time'),
            }
            existing_entry = POSPDTSCALE.objects.filter(
                store=store,
                section=section,
                type = file.get('type'),
                typenumber = file.get('typenumber'),
            ).first()

            if existing_entry:
                serializer = POSPDTSCALESerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save()
                    saved_entries.append(updated_entry)
                    self.log_action(
                        view_name="POSPDTScaleView",
                        action="UPDATE",
                        user=request.user.username,
                        details=file_data,
                        related_object={"backup_id": updated_entry.id}
                    )
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = POSPDTSCALESerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    self.log_action(
                        view_name="POSPDTScaleView",
                        action="CREATE",
                        user=request.user.username,
                        details=file_data,
                        related_object={"backup_id": new_entry.id}
                    )
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


        return Response(POSPDTSCALESerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        try:
            instance = POSPDTSCALE.objects.get(pk=pk)
        except POSPDTSCALE.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = POSPDTSCALESerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            self.log_action(
                view_name="POSPDTScaleView",
                action="UPDATE",
                user=request.user.username,
                details=request.data,
                related_object={"backup_id": instance.id}
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            instance = POSPDTSCALE.objects.get(pk=pk)
            instance.delete()
            self.log_action(
                view_name = "POSPDTScaleView",
                action = "DELETE",
                user = request.user.username,
                details = {"backup_id": pk},
                related_object = None
            )
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except POSPDTSCALE.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

class POSStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='POSStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="POS_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([ 'Date', 'Store', 'Store Name', 'Section', 'POS NO.', 'Counter NO.', "Complaint", "Action taken",  "Status", 'Remarks', 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.section, 
                             backup.posnumber, backup.counternumber, backup.complaint,
                             backup.actiontaken, backup.status, backup.remarks or "", backup.submitted_time])
            
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="POS_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Section")
        p.drawString(500, 750, "POS Number")
        p.drawString(600, 750, "Counter Number")
        p.drawString(700, 750, "Complaint")
        p.drawString(800, 750, "Action taken")
        p.drawString(900, 750, "Status")
        p.drawString(1000, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.section))
            p.drawString(500, y_position, str(backup.posnumber))
            p.drawString(600, y_position, str(backup.counternumber))
            p.drawString(700, y_position, str(backup.complaint))
            p.drawString(800, y_position, str(backup.actiontaken))
            p.drawString(900, y_position, str(backup.status))
            p.drawString(1000, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        section = request.query_params.get('section')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None)
        status_param = request.query_params.get('status') 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('POSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('POSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            
        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = POSStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        if section and section != "None": 
            queryset = queryset.filter(section=section)
        if status_param and status_param != "None":
            queryset = queryset.filter(status=status_param)

        sql_query = str(queryset.query)
        log_action('POSStatus', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query})  # Use username from params or fallback to request.user.username
        
        if format_type == 'csv':
            log_action('POSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('POSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = POSStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'section': file.get('section'),
                'submittedby':submittedby,
                'posnumber': file.get('posnumber'),
                'counternumber': file.get('counternumber'),
                'complaint': file.get('complaint'),
                'actiontaken': file.get('actiontaken'),
                'status': file.get('status'),
                'remarks': file.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
                'verified':False,
                'verifiedby':None
            }

            existing_entry = POSStatus.objects.filter(
                date=date,
                store=store,
                storename=storename,
                section = file.get('section'),
                posnumber = file.get('posnumber'),
            ).first()

            if existing_entry:
                serializer = POSStatusSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("POSStatus", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = POSStatusSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("POSStatus","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(POSStatusSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = POSStatus.objects.get(pk=pk)
            except POSStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = POSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = POSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = POSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = POSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('POSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = POSStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('POSStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            checklist = POSStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('POSStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except POSStatus.DoesNotExist:
            log_action('POSStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
class PDTStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='PDTStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)

    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        section = request.query_params.get('section') 
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        status_param = request.query_params.get('status') 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('PDTStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('PDTStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
        
        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = PDTStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        if section and section != "None": 
            queryset = queryset.filter(section=section)
        if status_param and status_param != "None":
            queryset = queryset.filter(status=status_param)
            
        sql_query = str(queryset.query)
        log_action('PDTStatus', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query})  # Use username from params or fallback to request.user.username
        
        if format_type == 'csv':
            log_action('PDTStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('PDTStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = PDTStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="PDT_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([ 'Date', 'Store', 'Store Name', 'Section', 'PDT NO.', "Complaint", "Action taken",  "Status", 'Remarks', 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.section, 
                             backup.pdtnumber, backup.complaint, backup.actiontaken, backup.status, backup.remarks or "", backup.submitted_time])
            
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="PDT_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Section")
        p.drawString(500, 750, "PDT Number")
        p.drawString(600, 750, "Complaint")
        p.drawString(700, 750, "Action taken")
        p.drawString(800, 750, "Status")
        p.drawString(900, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.section))
            p.drawString(500, y_position, str(backup.pdtnumber))
            p.drawString(600, y_position, str(backup.complaint))
            p.drawString(700, y_position, str(backup.actiontaken))
            p.drawString(800, y_position, str(backup.status))
            p.drawString(900, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'section': file.get('section'),
                'submittedby':submittedby,
                'pdtnumber': file.get('pdtnumber'),
                'complaint': file.get('complaint'),
                'actiontaken': file.get('actiontaken'),
                'status': file.get('status'),
                'remarks': file.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = PDTStatus.objects.filter(
                date=date, store=store,
                storename=storename, 
                section = file.get('section'),
                pdtnumber = file.get('pdtnumber'),
            ).first()

            if existing_entry:
                serializer = PDTStatusSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("PDTStatus", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = PDTStatusSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("PDTStatus","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(PDTStatusSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        # Get the authorized stores for the user
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = PDTStatus.objects.get(pk=pk)
            except PDTStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if the user is authorized to verify
            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            # Handle regular updates (excluding verification)
            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = PDTStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PDTStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle unauthorized verification attempt
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = PDTStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PDTStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle authorized update (excluding verification)
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = PDTStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('PDTStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Handle authorized verification
            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = PDTStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('PDTStatus', 'VERIFIED', user, {'status': 'Verified', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)


        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the records belong to authorized stores before updating
        updated = PDTStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        
        if updated > 0:
            log_action('PDTStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = PDTStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('PDTStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except PDTStatus.DoesNotExist:
            log_action('PDTStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
class ScaleStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='ScaleStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)

    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        section = request.query_params.get('section') 
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        status_param = request.query_params.get('status') 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('ScaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('ScaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
        
        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = ScaleStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        if section and section != "None": 
            queryset = queryset.filter(section=section)
        if status_param and status_param != "None":
            queryset = queryset.filter(status=status_param)
            
        sql_query = str(queryset.query)
        log_action('ScaleStatus', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query})  # Use username from params or fallback to request.user.username
        
        if format_type == 'csv':
            log_action('ScaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('ScaleStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)

        serializer = ScaleStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="Scale_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([ 'Date', 'Store', 'Store Name', 'Section', 'Scale NO.', "Complaint", "Action taken",  "Status", 'Remarks', 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.section, 
                             backup.scalenumber, backup.complaint, backup.actiontaken, backup.status, backup.remarks or "", backup.submitted_time])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Scale_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Section")
        p.drawString(500, 750, "Scale Number")
        p.drawString(600, 750, "Complaint")
        p.drawString(700, 750, "Action taken")
        p.drawString(800, 750, "Status")
        p.drawString(900, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.section))
            p.drawString(500, y_position, str(backup.scalenumber))
            p.drawString(600, y_position, str(backup.complaint))
            p.drawString(700, y_position, str(backup.actiontaken))
            p.drawString(800, y_position, str(backup.status))
            p.drawString(900, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'section': file.get('section'),
                'submittedby':submittedby,
                'scalenumber': file.get('scalenumber'),
                'complaint': file.get('complaint'),
                'actiontaken': file.get('actiontaken'),
                'status': file.get('status'),
                'remarks': file.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = ScaleStatus.objects.filter(
                date=date, store=store, storename=storename, section = file.get('section'),
                scalenumber = file.get('scalenumber'),
            ).first()

            if existing_entry:
                serializer = ScaleStatusSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("ScaleStatus", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = ScaleStatusSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(new_entry)
                    log_action("ScaleStatus","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(ScaleStatusSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        # Get the authorized stores for the user
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = ScaleStatus.objects.get(pk=pk)
            except ScaleStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = ScaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ScaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = ScaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ScaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = ScaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('ScaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = ScaleStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('ScaleStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = ScaleStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        
        if updated > 0:
            log_action('ScaleStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = ScaleStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('ScaleStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except ScaleStatus.DoesNotExist:
            log_action('ScaleStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
    
class StoreListView(APIView):
    def get(self, request):
        stores = Store.objects.all()
        serializer = StoreSerializer(stores, many=True)
        return Response(serializer.data)
    
class ServerListView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        if store:
            server_details = server.objects.filter(store=store)
            serializer = ServerSerializer(server_details, many=True)
            return Response(serializer.data, status=200)
        return Response({"error": "Store"}, status=400)
    
class POSPDTSCALEListView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        type = request.query_params.get('type')

        if store:
            pos_details = POSPDTSCALE.objects.filter(store=store, type = type)
            serializer = POSPDTSCALESerializer(pos_details, many=True)
            return Response(serializer.data, status=200)
        return Response({"error": "Store and Section are required"}, status=400)
    
class ServerView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')

        if not store:
            return Response({"detail": "Store is required."}, status=status.HTTP_400_BAD_REQUEST)

        if store:
            queryset = server.objects.filter(store=store)
        if store == 'None' or "":
            queryset = server.objects.all()

        sql_query = str(queryset.query) 
        log_action('Server', 'FETCH', request.user, {'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('Server', 'DOWNLOAD', request.user, {'format': 'csv', 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('Server', 'DOWNLOAD', request.user, {'format': 'pdf','store': store})
            return self.generate_pdf(queryset)
        serializer = ServerSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="Server_Details.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Store", "Server Name", "Serial Number", "Model Name", "Warranty Date", "AMC"])

        for backup in queryset:
            writer.writerow([backup.store, backup.servername, backup.serialnumber,
                             backup.modelname, backup.warrantyexp, backup.amc])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Server_DETAILS.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Store")
        p.drawString(200, 750, "Server Name")
        p.drawString(300, 750, "Serial Number")
        p.drawString(400, 750, "Model Name")
        p.drawString(500, 750, "Warranty Date")
        p.drawString(600, 750, "AMC")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.store))
            p.drawString(200, y_position, str(backup.servername))
            p.drawString(300, y_position, str(backup.serialnumber))
            p.drawString(400, y_position, str(backup.modelname))
            p.drawString(400, y_position, str(backup.warrantyexp))
            p.drawString(400, y_position, str(backup.amc))
            
            if y_position < 50:
                p.showPage()
                y_position = 750

        return response
    
    def post(self, request):
        store = request.data.get('store')
        files = request.data.get('files')

        if not store:
            return Response({"detail": "Store are required."}, status=status.HTTP_400_BAD_REQUEST)

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'store': store,
                'servername':file.get('servername'),
                'serialnumber': file.get('serialnumber'),
                'modelname': file.get('modelname'),
                'warrantyexp': file.get('warrantyexp'),
                'amc': file.get('amc'),
                'submitted_time': request.data.get('submitted_time'),
            }
            existing_entry = server.objects.filter(
                store=store,
                servername = file.get('servername'),
            ).first()

            if existing_entry:
                serializer = ServerSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save()
                    saved_entries.append(updated_entry)
                    log_action('Server',  'UPDATE', request.user, {'status': 'Updated',  'detail':request.data})
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = ServerSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("Server", "CREATE",request.user,{'status': 'Entry created', 'store': store, 'detail':request.data})
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


        return Response(ServerSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)
    
    def put(self, request, pk):
        try:
            instance = server.objects.get(pk=pk)
        except server.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ServerSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action('Server', 'UPDATE', request.user, {'status': 'Updated', 'pk': pk, 'detail': request.data})
            return Response(serializer.data, status=status.HTTP_200_OK)  # Changed from 201 to 200
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            instance = server.objects.get(pk=pk)
            instance.delete()
            log_action('Server', 'DELETE', request.user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except ServerSerializer.DoesNotExist:
            log_action('Server', 'DELETE', request.user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
        
class ServerStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='ServerStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        status_param = request.query_params.get('status') 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('ServerStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('ServerStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})

        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = serverStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        if status_param and status_param != "None":
            queryset = queryset.filter(status=status_param)
            
        sql_query = str(queryset.query)
        log_action('ServerStatus', 'FETCH', username or request.user.username, {'date': date, 'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('ServerStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('ServerStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)
        serializer = ServerStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="POS_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([ "Date", "Store", "Store Name", "Store", "Server Name", "Serial Number", "Model Name", "Warranty Date", "AMC","AC", "Status", "Remarks", 'Submitted Time'])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.servername, 
                             backup.serialnumber, backup.modelname, backup.warrantyexp,
                             backup.amc, backup.status, backup.ac, backup.remarks or "", backup.submitted_time])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="POS_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Server Name")
        p.drawString(500, 750, "Serial Number")
        p.drawString(600, 750, "Model Name")
        p.drawString(700, 750, "Warranty Date")
        p.drawString(800, 750, "AMC")
        p.drawString(900, 750, "Status")
        p.drawString(1000, 750, "AC")
        p.drawString(1100, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.servername))
            p.drawString(500, y_position, str(backup.serialnumber))
            p.drawString(600, y_position, str(backup.modelname))
            p.drawString(700, y_position, str(backup.warrantyexp))
            p.drawString(800, y_position, str(backup.amc))
            p.drawString(900, y_position, str(backup.status))
            p.drawString(1000, y_position, str(backup.ac))
            p.drawString(1100, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        ac=request.data.get('ac')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'servername':file.get('servername'),
                'serialnumber': file.get('serialnumber'),
                'modelname': file.get('modelname'),
                'warrantyexp': file.get('warrantyexp'),
                'amc': file.get('amc'),
                'status': file.get('status'),
                'remarks': file.get('remarks'),
                'ac': ac,
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = serverStatus.objects.filter(
                date=date, store=store, storename=storename,
                servername = file.get('servername'),
            ).first()

            if existing_entry:
                serializer = ServerStatusSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action('ServerStatus',  'UPDATE', user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = ServerStatusSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("ServerStatus", "CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(ServerStatusSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = serverStatus.objects.get(pk=pk)
            except serverStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = ServerStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('serverStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = ServerStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('serverStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = ServerStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('serverStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = ServerStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('serverStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)
            
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = serverStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        
        if updated > 0:
            log_action('ServerStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = serverStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('ServerStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except serverStatus.DoesNotExist:
            log_action('ServerStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
  
class UPSView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')

        if not store:
            return Response({"detail": "Store is required."}, status=status.HTTP_400_BAD_REQUEST)

        if store:
            queryset = UPS.objects.filter(store=store)
        if store == 'None' or "":
            queryset = UPS.objects.all()

        sql_query = str(queryset.query) 
        log_action('UPS', 'FETCH', request.user, {'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('UPS', 'DOWNLOAD', request.user, {'format': 'csv', 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('UPS', 'DOWNLOAD', request.user, {'format': 'pdf','store': store})
            return self.generate_pdf(queryset)
        serializer = UPSSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="UPS_Details.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Store", "UPS Name", "Serial Number", "Vendor Name", "Brand", "Area", "Capacity", "Warranty Date", "AMC Start Date", "AMC End Date"])

        for backup in queryset:
            writer.writerow([backup.store, backup.ups, backup.serialnumber, backup.vendorname, backup.brand, backup.area, 
                             backup.capacity, backup.warrantyexp, backup.amcstartdate, backup.amcenddate, backup.amc])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="UPS_DETAILS.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Store")
        p.drawString(200, 750, "UPS Name")
        p.drawString(300, 750, "Serial Number")
        p.drawString(400, 750, "Vendor Name")
        p.drawString(500, 750, "Brand")
        p.drawString(600, 750, "Area")
        p.drawString(700, 750, "Capacity")
        p.drawString(800, 750, "Warranty Date")
        p.drawString(900, 750, "AMC Start Date")
        p.drawString(1000, 750, "AMC End Date")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.store))
            p.drawString(200, y_position, str(backup.ups))
            p.drawString(300, y_position, str(backup.serialnumber))
            p.drawString(400, y_position, str(backup.vendorname))
            p.drawString(500, y_position, str(backup.brand))
            p.drawString(600, y_position, str(backup.area))
            p.drawString(700, y_position, str(backup.capacity))
            p.drawString(800, y_position, str(backup.warrantyexp))
            p.drawString(900, y_position, str(backup.amcstartdate))
            p.drawString(1000, y_position, str(backup.amcenddate))
            
            if y_position < 50:
                p.showPage()
                y_position = 750

        return response
    
    def post(self, request):
        store = request.data.get('store')
        files = request.data.get('files')

        if not store:
            return Response({"detail": "Store is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not files or not isinstance(files, list):
            return Response({"detail": "At least one valid file entry is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            ups = file.get('ups')
            serialnumber = file.get('serialnumber')

            if not ups or not serialnumber:
                return Response({"detail": "UPS and Serial Number are required for each file."}, status=status.HTTP_400_BAD_REQUEST)

            if file.get('type') == "warranty" and not file.get('warrantyexp'):
                return Response({"detail": "Warranty expiration date is required for warranty type."}, status=status.HTTP_400_BAD_REQUEST)
            elif file.get('type') == "amc" and (not file.get('amcstartdate') or not file.get('amcenddate')):
                return Response({"detail": "AMC start and end dates are required for AMC type."}, status=status.HTTP_400_BAD_REQUEST)

            file_data = {
                'store': store,
                'ups': ups,
                'serialnumber': serialnumber,
                'vendorname': file.get('vendorname'),
                'brand': file.get('brand'),
                'area': file.get('area'),
                'capacity': file.get('capacity'),
                'warrantyexp': file.get('warrantyexp') or None, 
                'amcstartdate': file.get('amcstartdate') or None, 
                'amcenddate': file.get('amcenddate') or None, 
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = UPS.objects.filter(store=store, ups=ups, serialnumber=serialnumber).first()

            if existing_entry:
                serializer = UPSSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save()
                    saved_entries.append(updated_entry)
                    log_action('UPS', 'UPDATE', request.user, {'status': 'Updated', 'detail': request.data})
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = UPSSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("UPS", "CREATE", request.user, {'status': 'Created', 'store': store, 'detail': request.data})
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(UPSSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)
    
    def put(self, request, pk):
        try:
            instance = UPS.objects.get(pk=pk)
        except UPS.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = UPSSerializer(instance, data=request.data, partial=True)
        file_data = request.data
        file_data['warrantyexp'] = file_data.get('warrantyexp') or None
        file_data['amcstartdate'] = file_data.get('amcstartdate') or None
        file_data['amcenddate'] = file_data.get('amcenddate') or None
        if serializer.is_valid():
            serializer.save()
            log_action('UPS', 'UPDATE', request.user, {'status': 'Updated', 'pk': pk, 'detail': request.data})
            return Response(serializer.data, status=status.HTTP_200_OK)  # Changed from 201 to 200
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            instance = UPS.objects.get(pk=pk)
            instance.delete()
            log_action('UPS', 'DELETE', request.user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except UPSSerializer.DoesNotExist:
            log_action('UPS', 'DELETE', request.user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
          
class UPSListView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        if store:
            ups_details = UPS.objects.filter(store=store)
            serializer = UPSSerializer(ups_details, many=True)
            return Response(serializer.data, status=200)
        return Response({"error": "Store"}, status=400)
    
class UPSStatusView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='UPSStatus').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)

    def get(self, request):
        date = request.query_params.get('date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        status_param = request.query_params.get('status') 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('UPSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
        if action == "PDF":
            log_action('UPSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})

        if not date:
            return Response({"detail": "Date is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = UPSStatus.objects.filter(date=date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)
        if status_param and status_param != "None":
            queryset = queryset.filter(status=status_param)
            
        sql_query = str(queryset.query)
        log_action('UPSStatus', 'FETCH',username or request.user.username, {'date': date, 'store': store, "query": sql_query })
        
        if format_type == 'csv':
            log_action('UPSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'date': date, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('UPSStatus', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'date': date, 'store': store})
            return self.generate_pdf(queryset)
        
        serializer = UPSStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="UPS_Status.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow([ "Date", "Store", "Store Name", "UPS Name", "Serial Number", "Vendor Name", "Brand", "Area", "Capacity","Type", "Warranty Date", "AMC Start Date", "AMC End Date","AC", "Status", "Remarks"])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, backup.ups, 
                             backup.serialnumber, backup.vendorname, backup.brand, backup.area,
                             backup.capacity, backup.type, backup.warrantyexp, backup.amcstartdate,
                             backup.amcenddate, backup.ac, backup.status, backup.remarks or ""])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="UPS_Status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "UPS Name")
        p.drawString(500, 750, "Serial Number")
        p.drawString(600, 750, "Vendor Name")
        p.drawString(700, 750, "Brand")
        p.drawString(800, 750, "Area")
        p.drawString(900, 750, "Capacity")
        p.drawString(1000, 750, "Type")
        p.drawString(1100, 750, "Warranty Date")
        p.drawString(1200, 750, "AMC Start Date")
        p.drawString(1300, 750, "AMC End Date")
        p.drawString(1400, 750, "Status")
        p.drawString(1500, 750, "AC")
        p.drawString(1600, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.ups))
            p.drawString(500, y_position, str(backup.serialnumber))
            p.drawString(600, y_position, str(backup.vendorname))
            p.drawString(700, y_position, str(backup.brand))
            p.drawString(800, y_position, str(backup.area))
            p.drawString(900, y_position, str(backup.capacity))
            p.drawString(1000, y_position, str(backup.type))
            p.drawString(1100, y_position, str(backup.warrantyexp))
            p.drawString(1200, y_position, str(backup.amcstartdate))
            p.drawString(1300, y_position, str(backup.amcenddate))
            p.drawString(1400, y_position, str(backup.status))
            p.drawString(1500, y_position, str(backup.ac))
            p.drawString(1600, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename = request.data.get('storename')
        ac = request.data.get('ac')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')
        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            if file.get('type') == "warranty" and not file.get('warrantyexp'):
                return Response({"detail": "Warranty expiration date is required for warranty type."}, status=status.HTTP_400_BAD_REQUEST)
            elif file.get('type') == "amc" and (not file.get('amcstartdate') or not file.get('amcenddate')):
                return Response({"detail": "AMC start and end dates are required for AMC type."}, status=status.HTTP_400_BAD_REQUEST)

            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'ups': file.get('ups'),
                'serialnumber': file.get('serialnumber'),
                'vendorname': file.get('vendorname'),
                'brand': file.get('brand'),
                'area': file.get('area'),
                'capacity': file.get('capacity'),
                'type': file.get('type'),
                'warrantyexp': file.get('warrantyexp') or None,
                'amcstartdate': file.get('amcstartdate') or None,
                'amcenddate': file.get('amcenddate') or None,
                'status': file.get('status'),
                'remarks': file.get('remarks'),
                'ac': ac,
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = UPSStatus.objects.filter(
                date=date, store=store, storename=storename, ups=file.get('ups'),
            ).first()

            if existing_entry:
                serializer = UPSStatusSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action('UPSStatus', "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = UPSStatusSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("UPSStatus", "CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(UPSStatusSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        # Get the authorized stores for the user
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = UPSStatus.objects.get(pk=pk)
            except UPSStatus.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)
            
            file_data = request.data
            file_data['warrantyexp'] = file_data.get('warrantyexp') or None
            file_data['amcstartdate'] = file_data.get('amcstartdate') or None
            file_data['amcenddate'] = file_data.get('amcenddate') or None

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = UPSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('UPSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = UPSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('UPSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = UPSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('UPSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = UPSStatusSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('UPSStatus', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = UPSStatus.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        
        if updated > 0:
            log_action('UPSStatus', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store': authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = UPSStatus.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('UPSStatus', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except UPSStatus.DoesNotExist:
            log_action('UPSStatus', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
  
class DailyChecklist(APIView):
    def process_status(self, store, date, model, checklist_name):
        statuses = []
        remarks = []
        no_data_found = True
        

        if hasattr(model, 'status'):
            if checklist_name == "POS":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("posnumber", "status", "complaint", "actiontaken", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        status = record["status"]
                        statuses.append(status)
                        if status == "Not Ok":
                            remarks.append(f"{checklist_name} - POS Number: {record['posnumber']}, Status: {status}, Remarks: {record['remarks'] or 'No remarks provided.'}")

            elif checklist_name == "Scale":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("scalenumber", "status", "complaint", "actiontaken", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        status = record["status"]
                        statuses.append(status)
                        if status == "Not Ok":
                            remarks.append(f"{checklist_name} - Scale Number: {record['scalenumber']}, Status: {status}, Remarks: {record['remarks'] or 'No remarks provided'}")

            elif checklist_name == "PDT":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("pdtnumber", "status", "complaint", "actiontaken", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        status = record["status"]
                        statuses.append(status)
                        if status == "Not Ok":
                            remarks.append(f"{checklist_name} - PDT Number: {record['pdtnumber']}, Status: {status}, Remarks: {record['remarks'] or 'No remarks provided'}")

            elif checklist_name == "UPS":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("ups", "warrantyexp", "amcstartdate", "amcenddate", "status", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        status = record["status"]
                        statuses.append(status)
                        if status == "Not Ok":
                            remarks.append(f"{checklist_name} - UPS Name: {record['ups']}, Warranty Date: {record['warrantyexp']}, AMC Period: {record['amcstartdate']} to {record['amcenddate']}, Status: {status}, Remarks: {record['remarks'] or 'No remarks provided.'}")
            
            elif checklist_name == "Server":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("servername", "warrantyexp", "status", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        status = record["status"]
                        statuses.append(status)
                        if status == "Not Ok":
                            remarks.append(f"{checklist_name} - Server Name: {record['servername']}, Warranty Date: {record['warrantyexp']}, Status: {status}, Remarks: {record['remarks'] or 'No remarks provided.'}")

        elif hasattr(model, 'tpcentraldb') and hasattr(model, 'tpcmdb'):
            if checklist_name == "Ind Store Backup":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        server_name = record["servername"]
                        tpcentraldb_status = "OK" if record["tpcentraldb"] == "Ok" else "Not Ok"
                        tpcmdb_status = "OK" if record["tpcmdb"] == "Ok" else "Not Ok"
                        statuses.extend([tpcentraldb_status, tpcmdb_status])

                        if tpcentraldb_status == "Not Ok":
                            remarks.append(f"{checklist_name} - Server Name: {server_name}, TPCentralDB: {tpcentraldb_status}, Remarks: {record['remarks'] or 'No remarks provided.'}")
                        if tpcmdb_status == "Not Ok":
                            remarks.append(f"{checklist_name} - Server Name: {server_name}, TPCMDB: {tpcmdb_status}, Remarks: {record['remarks'] or 'No remarks provided.'}")
            
            if checklist_name == "Acronics Backup":
                records = list(model.objects.filter(store=store.storecode, date=date, verified=True).values("servername", "tpcentraldb", "tpcmdb", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        server_name = record["servername"]
                        tpcentraldb_status = "OK" if record["tpcentraldb"] == "Ok" else "Not Ok"
                        tpcmdb_status = "OK" if record["tpcmdb"] == "Ok" else "Not Ok"
                        statuses.extend([tpcentraldb_status, tpcmdb_status])

                        if tpcentraldb_status == "Not Ok":
                            remarks.append(f"{checklist_name} - Server Name: {server_name}, TPCentralDB: {tpcentraldb_status}, Remarks: {record['remarks'] or 'No remarks provided.'}")
                        if tpcmdb_status == "Not Ok":
                            remarks.append(f"{checklist_name} - Server Name: {server_name}, TPCMDB: {tpcmdb_status}, Remarks: {record['remarks'] or 'No remarks provided.'}")

        elif hasattr(model, 'zcasr') and hasattr(model, 'zdsr') and hasattr(model, 'zpmc') and hasattr(model, 'zread'):
            if checklist_name == "Sales Status":
                yesterday_date = (datetime.strptime(date, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
                print(yesterday_date)
                records = list(model.objects.filter(store=store.storecode, date=yesterday_date, verified=True).values("zcasr", "zdsr", "zpmc", "zread", "remarks"))
                if not records:
                    statuses.append("Not Available")
                    remarks.append("")
                    no_data_found = False
                else:
                    for record in records:
                        zcasr_status = "OK" if record["zcasr"] == "Updated" else "Not Ok"
                        zdsr_status = "OK" if record["zdsr"] == "Updated" else "Not Ok"
                        zpmc_status = "OK" if record["zpmc"] == "Updated" else "Not Ok"
                        zread_status = "OK" if record["zread"] == "Updated" else "Not Ok"

                        statuses.extend([zcasr_status, zdsr_status, zpmc_status, zread_status])

                        if zcasr_status == "Not Ok":
                            remarks.append(f"{checklist_name}- zcasr: {record['zcasr']}, Remarks: {record['remarks'] or 'No remarks provided.'}")
                        if zdsr_status == "Not Ok":
                            remarks.append(f"{checklist_name} - zdsr: {record['zdsr']}, Remarks: {record['remarks'] or 'No remarks provided.'}")
                        if zpmc_status == "Not Ok":
                            remarks.append(f"{checklist_name} - zpmc: {record['zpmc']}, Remarks: {record['remarks'] or 'No remarks provided.'}")
                        if zread_status == "Not Ok":
                            remarks.append(f"{checklist_name} - zread: {record['zread']}, Remarks: {record['remarks'] or 'No remarks provided.'}")

        if no_data_found:
            overall_status = "Not Ok" if "Not Ok" in statuses else "Ok"
        else:
            overall_status = "Not Available"

        return overall_status, remarks

    def get(self, request):
        selected_date = request.GET.get('date')
        if not selected_date:
            return JsonResponse({'error': 'Date is required'}, status=400)
        user = request.GET.get('userid')  
        userGroup = request.GET.get('userGroup')
        export_format = request.GET.get('format')  
        print(user) 
        try:
            profile = Profile.objects.get(employeeid=user)
        except Profile.DoesNotExist:
            return JsonResponse({'error': 'User profile not found'}, status=403)

        if userGroup == 'Admin_User':
            stores = Store.objects.exclude(storecode='9000')   
        else:  
            if profile.designation in ['IT Support', 'Assistant IT Incharge', 'IT Incharge']:
                stores = Store.objects.filter(storecode=profile.storecode)
            elif profile.designation == 'Regional IT Manager':
                store_codes = profile.storeunder.split(',') if profile.storeunder else []
                store_codes.append(profile.storecode)  
                stores = Store.objects.filter(storecode__in=store_codes)
            elif profile.designation == 'IT Manager':
                stores = Store.objects.all() 
            else:
                return JsonResponse({'error': 'Access denied'}, status=403)
            
        result = {
            'date': selected_date,
            'checklist': []
        }

        for store in stores:
            store_checklist = {
                "store_code": store.storecode,
                "store_name": store.storename,
                "server_status": "",
                "pos_status": "",
                "scale_status": "",
                "pdt_status": "",
                "ind_store_backup": "",
                "sales_status": "",
                "acronics_backup": "",
                "pos_db_backup": "",
                "ups_status": "",
                "remarks": ""
            }

            checklist_parts = [
                ("Server", serverStatus),
                ("POS", POSStatus),
                ("Scale", ScaleStatus),
                ("PDT", PDTStatus),
                ("Ind Store Backup", IndStoreBackup),
                ("Sales Status", SaleStatus),
                ("Acronics Backup", AcronicsBackup),
                ("POS DB Backup", PosDbBackup),
                ("UPS", UPSStatus)
            ]

            for checklist_name, model in checklist_parts:
                overall_status, remarks = self.process_status(store, selected_date, model, checklist_name)
                store_checklist[f"{checklist_name.lower().replace(' ', '_')}_status"] = overall_status
                if remarks:
                    if store_checklist["remarks"]:
                        store_checklist["remarks"] += "<br>" + "<br>".join(remarks)  
                    else:
                        store_checklist["remarks"] = "<br>".join(remarks)  

            result['checklist'].append(store_checklist)
        if export_format == 'csv':
            return self.generate_csv(result['checklist'])
        elif export_format == 'pdf':
            return self.generate_pdf(result['checklist'])

        return JsonResponse(result, safe=False)

    def generate_pdf(self, checklist, selected_date):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="store_checklist_{selected_date}.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y_position = 750
        
        # Title
        p.setFont("Helvetica-Bold", 14)
        p.drawString(250, 800, "Daily Checklist")  # Centered title
        p.setFont("Helvetica", 10)
        p.drawString(450, 780, f"Date: {selected_date}")  # Date at the top right

        # Headers including date
        headers = ["Date", "Store Code", "Store Name", "Server Status", "POS Status", "Scale Status", "PDT Status",
                "Ind Store Backup", "Sales Status", "Acronics Backup", "UPS Status", "Remarks"]
        
        x_positions = [30, 100, 200, 300, 380, 460, 540, 620, 700, 780, 860, 940]  
        
        # Draw table headers
        p.setFont("Helvetica-Bold", 9)
        for i, header in enumerate(headers):
            p.drawString(x_positions[i], y_position, header)
        
        y_position -= 20
        p.setFont("Helvetica", 8)

        for item in checklist:
            p.drawString(x_positions[0], y_position, selected_date)  # Add date column
            p.drawString(x_positions[1], y_position, str(item["store_code"]))
            p.drawString(x_positions[2], y_position, str(item["store_name"]))
            p.drawString(x_positions[3], y_position, str(item["server_status"]))
            p.drawString(x_positions[4], y_position, str(item["pos_status"]))
            p.drawString(x_positions[5], y_position, str(item["scale_status"]))
            p.drawString(x_positions[6], y_position, str(item["pdt_status"]))
            p.drawString(x_positions[7], y_position, str(item["ind_store_backup"]))
            p.drawString(x_positions[8], y_position, str(item["sales_status"]))
            p.drawString(x_positions[9], y_position, str(item["acronics_backup"]))
            p.drawString(x_positions[11], y_position, str(item["ups_status"]))

            # Remove <br> and replace with newline
            remarks = item["remarks"].replace("<br>", "\n") if item["remarks"] else "No remarks"
            p.drawString(x_positions[12], y_position, remarks)

            y_position -= 20
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

class POSListView(APIView):
    def get(self, request):
        store = request.query_params.get('store')
        type = request.query_params.get('type')

        if store:
            pos_details = POSPDTSCALE.objects.filter(store=store, type = type)
            serializer = POSPDTSCALESerializer(pos_details, many=True)
            return Response(serializer.data, status=200)
        return Response({"error": "Store and Section are required"}, status=400)
    
class POSPerformanceView(APIView):
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='POSPerformance').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')
        action = request.query_params.get('action', None) 
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('POSPerformance', 'DOWNLOAD', username or request.user.username, {'format': 'csv','startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
        if action == "PDF":
            log_action('POSPerformance', 'DOWNLOAD', username or request.user.username, {'format': 'pdf','startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
        
        queryset = POSPerformance.objects.all()
        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store and store != "None":  
            queryset = queryset.filter(store=store)

        sql_query = str(queryset.query) 
        log_action('POSPerformance', 'FETCH', username or request.user.username, { 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None,'store': store, "query": sql_query })
        if format_type == 'csv':
            log_action('POSPerformance', 'DOWNLOAD', username or request.user.username, {'format': 'csv','startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('POSPerformance', 'DOWNLOAD', username or request.user.username, {'format': 'pdf','startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_pdf(queryset)

        serializer = POSPerformanceSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="POS_Performance_Status_.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(["Date", "Store", "Store Name", "POS Number", "POS Up Time", "POS Down Time", "Remarks"])

        for backup in queryset:
            writer.writerow([backup.date, backup.store, backup.storename, 
                             backup.posnumber, backup.posuptime, backup.posdowntime, backup.remarks or "", backup.submitted_time])
            
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="POS_Performance_Status_.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "POS Number")
        p.drawString(500, 750, "POS Up Time")
        p.drawString(600, 750, "POS Down Time")
        p.drawString(700, 750, "Remarks")
        
        y_position = 730
        
        for backup in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(backup.date))
            p.drawString(200, y_position, str(backup.store))
            p.drawString(300, y_position, str(backup.storename))
            p.drawString(400, y_position, str(backup.posnumber))
            p.drawString(500, y_position, str(backup.posuptime))
            p.drawString(600, y_position, str(backup.posdowntime))
            p.drawString(700, y_position, str(backup.remarks or ""))
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
    def post(self, request):
        date = request.data.get('date')
        store = request.data.get('store')
        storename=request.data.get('storename')
        submittedby = request.data.get('submittedby')
        user = request.data.get('user')  
        
        if not date or not store:
            return Response({"detail": "Date and store are required."}, status=status.HTTP_400_BAD_REQUEST)

        files = request.data.get('files')

        if not files:
            return Response({"detail": "At least one file is required."}, status=status.HTTP_400_BAD_REQUEST)

        saved_entries = []
        for file in files:
            file_data = {
                'date': date,
                'store': store,
                'storename': storename,
                'submittedby':submittedby,
                'posnumber': file.get('posnumber'),
                'posuptime': file.get('posuptime'),
                'posdowntime': file.get('posdowntime'),
                'remarks': file.get('remarks'),
                'submitted_time': request.data.get('submitted_time'),
            }

            existing_entry = POSPerformance.objects.filter(
                date=date,
                store=store,
                storename=storename,
                posnumber = file.get('posnumber'),
            ).first()

            if existing_entry:
                serializer = POSPerformanceSerializer(existing_entry, data=file_data, partial=True)
                if serializer.is_valid():
                    updated_entry = serializer.save(verified=False, verifiedby=None)
                    saved_entries.append(updated_entry)
                    log_action("POSPerformance", "UPDATE", user, file_data,  updated_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer = POSPerformanceSerializer(data=file_data)
                if serializer.is_valid():
                    new_entry = serializer.save()
                    saved_entries.append(new_entry)
                    log_action("POSPerformance","CREATE", user, file_data,  new_entry.id)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(POSPerformanceSerializer(saved_entries, many=True).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)  

        # Get the authorized stores for the user
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = POSPerformance.objects.get(pk=pk)
            except POSPerformance.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = POSPerformanceSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSPerformance', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = POSPerformanceSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSPerformance', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = POSPerformanceSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save(verified=False, verifiedby=None)
                    log_action('POSPerformance', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = POSPerformanceSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save(verified=False, verifiedby=None)
                    log_action('POSPerformance', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = POSPerformance.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)
        
        if updated > 0:
            log_action('POSPerformance', 'VERIFIED', user, {'status': 'Verified', 'ids': ids, 'Store':authorized_stores})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = POSPerformance.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('POSPerformance', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except POSPerformance.DoesNotExist:
            log_action('POSPerformance', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
            
class InvoiceStatusView(APIView):
    def get(self, request):
        date = request.query_params.get('date')
        vendor_name = request.query_params.get('vendorName')  # Corrected field name
        submittedby = request.query_params.get('submittedBy')  # Corrected field name
        format_type = request.query_params.get('format', 'json')

        queryset = InvoiceStatus.objects.all()

        if date:
            queryset = queryset.filter(date=date)
        if vendor_name:
            queryset = queryset.filter(vendorName=vendor_name)  # Corrected field name
        if submittedby:
            queryset = queryset.filter(submittedBy__icontains=submittedby.strip())  # Corrected field name

        if format_type == 'csv':
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            return self.generate_pdf(queryset)

        serializer = InvoiceStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="invoice_status.csv"'
        writer = csv.writer(response)
        writer.writerow(['Date', 'Invoice Type', 'Vendor Name', 'Invoice Amount', 'Approved By',
                         'Submitted By', 'H.D Date', 'Re-Collecting Date', 'Final Status', 'Final Updation'])
        for invoice in queryset:
            writer.writerow([invoice.date, invoice.invoiceType, invoice.vendorName, invoice.invoiceAmount,
                             invoice.approvedBy, invoice.submittedBy, invoice.hdDate, invoice.reCollectingDate,
                             invoice.finalStatus, invoice.finalUpdation])
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="invoice_status.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        headers = ["Date", "Invoice Type", "Vendor Name", "Invoice Amount", "Approved By",
                   "Submitted By", "H.D Date", "Re-Collecting Date", "Final Status", "Final Updation"]
        x_positions = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
        y_position = 750

        for i, header in enumerate(headers):
            p.drawString(x_positions[i], y_position, header)

        y_position -= 20
        for invoice in queryset:
            p.drawString(50, y_position, str(invoice.date))
            p.drawString(100, y_position, invoice.invoiceType)
            p.drawString(200, y_position, invoice.vendorName)
            p.drawString(300, y_position, str(invoice.invoiceAmount))
            p.drawString(400, y_position, invoice.approvedBy)
            p.drawString(500, y_position, invoice.submittedBy)
            p.drawString(600, y_position, str(invoice.hdDate) if invoice.hdDate else "")
            p.drawString(700, y_position, str(invoice.reCollectingDate) if invoice.reCollectingDate else "")
            p.drawString(800, y_position, invoice.finalStatus)
            p.drawString(900, y_position, invoice.finalUpdation if invoice.finalUpdation else "")

            y_position -= 20
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def post(self, request):
        serializer = InvoiceStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)  # Debugging log
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            instance = InvoiceStatus.objects.get(pk=pk)
        except InvoiceStatus.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = InvoiceStatusSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            invoice = InvoiceStatus.objects.get(pk=pk)
            invoice.delete()
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except InvoiceStatus.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

class ExpenseClaimView(APIView):
    def get(self, request):
        # Get query parameters
        date = request.query_params.get('date')
        name_of_requester = request.query_params.get('nameOfRequester')
        submitted_by = request.query_params.get('submittedBy')
        format_type = request.query_params.get('format', 'json')
        
        # Filter the queryset
        queryset = ExpenseClaim.objects.all()
        if date:
            queryset = queryset.filter(date=date)
        if name_of_requester:
            queryset = queryset.filter(nameOfRequester=name_of_requester)
        if submitted_by:
            queryset = queryset.filter(submittedBy=submitted_by)  # Filter by 'submittedBy'
        
        # Export formats
        if format_type == 'csv':
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            return self.generate_pdf(queryset)
        
        # JSON response
        serializer = ExpenseClaimSerializer(queryset, many=True)
        return Response(serializer.data)

    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expense_claims.csv"'
        writer = csv.writer(response)
        
        # Write CSV header
        writer.writerow([
            'Date', 'Name of Requester', 'Designation', 'Claim Amount', 'Purpose',
            'Manager Approval', 'Submitted By', 'HD Date to Sree', 
            'CIO Approval', 'HD Date to Rahul', 'Re-Collecting Date from 7th', 'Final Status'
        ])
        
        # Write data rows
        for claim in queryset:
            writer.writerow([
                claim.date, claim.nameOfRequester, claim.designation, claim.claimAmount,
                claim.purpose, claim.managerApproval, claim.submittedBy, claim.hdDateToSree,
                claim.cioApproval, claim.hdDateToRahul, claim.reCollectingDateFrom7th, claim.finalStatus
            ])
        
        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="expense_claims.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        # Header row
        headers = [
            'Date', 'Name of Requester', 'Designation', 'Claim Amount', 'Purpose',
            'Manager Approval', 'Submitted By', 'HD Date to Sree',
            'CIO Approval', 'HD Date to Rahul', 'Re-Collecting Date from 7th', 'Final Status'
        ]
        x_positions = [50, 150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1650]
        y_position = 750

        for i, header in enumerate(headers):
            p.drawString(x_positions[i], y_position, header)

        # Data rows
        y_position -= 20
        for claim in queryset:
            data = [
                claim.date, claim.nameOfRequester, claim.designation, claim.claimAmount,
                claim.purpose, claim.managerApproval, claim.submittedBy, claim.hdDateToSree,
                claim.cioApproval, claim.hdDateToRahul, claim.reCollectingDateFrom7th, claim.finalStatus
            ]
            for i, value in enumerate(data):
                p.drawString(x_positions[i], y_position, str(value))
            y_position -= 20
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def post(self, request):
        serializer = ExpenseClaimSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Log and return errors
        print(serializer.errors)  # Logs on the server
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            instance = ExpenseClaim.objects.get(pk=pk)
        except ExpenseClaim.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseClaimSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            claim = ExpenseClaim.objects.get(pk=pk)
            claim.delete()
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except ExpenseClaim.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)

class BackupDetailView(APIView):
    def get(self, request):
        review_month = request.query_params.get('reviewMonth')
        current_year = request.query_params.get('year')
        store = request.query_params.get('store')
        format_type = request.query_params.get('format', 'json')

        queryset = BackupDetail.objects.all()

        if review_month:
            queryset = queryset.filter(reviewMonth=review_month)

        if current_year:
            queryset = queryset.filter(year=current_year)

        if store:
            queryset = queryset.filter(site=store)

        response_data = []

        for backup in queryset:
            month_name = backup.reviewMonth
            year = int(backup.year) if backup.year else datetime.now().year

            try:
                month_num = list(calendar.month_name).index(month_name)
            except ValueError:
                month_num = 1  
            _, days_in_month = calendar.monthrange(year, month_num)

            failed_dates = backup.failed_dates if isinstance(backup.failed_dates, list) else json.loads(backup.failed_dates or "[]")
            success_dates = backup.success_dates if isinstance(backup.success_dates, list) else json.loads(backup.success_dates or "[]")
            
            days_status = []
            for day in range(1, days_in_month + 1):
                date_str = f"{year}-{month_num:02d}-{day:02d}"
                status_filter = "F" if date_str in failed_dates else "S" if date_str in success_dates else "ND"
                days_status.append(status_filter)

            backup_data = BackupDetailSerializer(backup).data
            backup_data["days"] = days_status
            backup_data["reviewMonth"] = backup.reviewMonth

            response_data.append(backup_data)

        if format_type == 'pdf':
            return self.generate_pdf(queryset)

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data

        required_fields = ["date", "empid", "designation", "serverName", "ipAddress", "site"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response({"error": f"Missing required fields: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

        print("Received NAS Backup Data:", data)

        serializer = BackupDetailSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            review_month = data.get("reviewMonth")
            year = data.get("year")
            site = data.get("site")

            if review_month and year and site:
                try:
                    month_number = datetime.strptime(review_month, "%B").month
                    year = int(year)
                    acronics_entries = AcronicsBackup.objects.filter(store=site, date__year=year,date__month=month_number)

                    failed_dates = []
                    success_dates = []

                    for entry in acronics_entries:
                        entry_date = entry.date
                        tp = entry.tpcentraldb
                        cm = entry.tpcmdb
                        verified = entry.verified
                        
                        if tp != "Ok" and verified or cm != "Ok" and verified:
                            failed_dates.append(entry_date)
                        elif tp == "Ok" and cm == "Ok" and verified :
                            success_dates.append(entry_date)

                    print("✅ Acronics classification:")
                    print("Failed:", failed_dates)
                    print("Success:", success_dates)
                    
                    backup_detail = BackupDetail.objects.get(id=serializer.data['id'])
                    backup_detail.failed_dates = [entry_date.strftime("%Y-%m-%d") for entry_date in failed_dates]
                    backup_detail.success_dates = [entry_date.strftime("%Y-%m-%d") for entry_date in success_dates]
                    backup_detail.save()

                    return Response({
                        "nas_backup": serializer.data,
                        "acronics_classified": {
                            "failed_dates": failed_dates,
                            "success_dates": success_dates,
                        }
                    }, status=status.HTTP_201_CREATED)

                except ValueError as ve:
                    print("Month conversion error:", ve)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # def post(self, request):
    #     data = request.data

    #     required_fields = ["date", "empid", "designation", "serverName", "ipAddress", "site"]
    #     missing_fields = [field for field in required_fields if not data.get(field)]
    #     if missing_fields:
    #         return Response({"error": f"Missing required fields: {', '.join(missing_fields)}"}, status=status.HTTP_400_BAD_REQUEST)

    #     if "failed_dates" in data and not isinstance(data["failed_dates"], list):
    #         try:
    #             data["failed_dates"] = json.loads(data["failed_dates"])
    #         except json.JSONDecodeError:
    #             data["failed_dates"] = []

    #     print("Received NAS Backup Data:", data)

    #     serializer = BackupDetailSerializer(data=data)
    #     if serializer.is_valid():
    #         serializer.save()

    #         review_month = data.get("reviewMonth") 
    #         year = data.get("year")
    #         site = data.get("site")

    #         if review_month and year and site:
    #             try:
    #                 month_number = datetime.strptime(review_month, "%B").month
    #                 year = int(year)

    #                 acronics_entries = AcronicsBackup.objects.filter(
    #                     store=site,
    #                     date__year=year,
    #                     date__month=month_number
    #                 )

    #                 acronics_data = [{
    #                     "date": entry.date,
    #                     "store": entry.store,
    #                     "servername": entry.servername,
    #                     "tpcentraldb": entry.tpcentraldb,
    #                     "tpcmdb": entry.tpcmdb,
    #                     "verified": entry.verified,
    #                 } for entry in acronics_entries]
    #                 print("Acronics Data Found for Month-Year-Site:", review_month, year, site)
    #                 for record in acronics_data:
    #                     print(record)

    #                 return Response({
    #                     "nas_backup": serializer.data,
    #                     "acronics_data": acronics_data
    #                 }, status=status.HTTP_201_CREATED)

    #             except ValueError as ve:
    #                 print("Month conversion error:", ve)

    #         return Response(serializer.data, status=status.HTTP_201_CREATED)

    #     return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def generate_pdf(self, queryset):
        """
        Generate a PDF file from the queryset with additional fields, including `days_status` and `reviewMonth`.
        """
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="backup_details.pdf"'
        
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        # Header row
        headers = [
            "ID", "Date", "Emp ID", "Full Name", "Designation", "Verifier Name",
            "Verifier Emp ID", "Verifier Designation", "Size1", "Size2", "Site",
            "Date Copied 1", "Date Copied 2", "File Name 1", "File Name 2", 
            "Server Name", "IP Address", "Frequency", "Type of Backup", "Review Month", "Days Status"
        ]
        x_positions = [30, 80, 130, 200, 270, 340, 410, 480, 550, 620, 690, 760, 830, 900, 970, 1040, 1110, 1180, 1250, 1320, 1400]
        y_position = 750

        for i, header in enumerate(headers):
            p.drawString(x_positions[i], y_position, header)

        # Data rows
        y_position -= 20
        for backup in queryset:
            year, month = backup.date.year, backup.date.month
            _, days_in_month = calendar.monthrange(year, month)

            # Process failed dates
            failed_dates = backup.failed_dates if isinstance(backup.failed_dates, list) else json.loads(backup.failed_dates or "[]")

            # Generate days list
            days_status = ["F" if f"{year}-{month:02d}-{i:02d}" in failed_dates else "S" for i in range(1, days_in_month + 1)]

            # Construct row dictionary
            row = {
                "id": backup.id,
                "date": str(backup.date),
                "empid": backup.empid,
                "fullname": backup.fullname,
                "designation": backup.designation,
                "verifierName": backup.verifierName,
                "verifierEmpid": backup.verifierEmpid,
                "verifierDesignation": backup.verifierDesignation,
                "size1": backup.size1,
                "size2": backup.size2,
                "site": backup.site,
                "dateCopied1": str(backup.dateCopied1),
                "dateCopied2": str(backup.dateCopied2),
                "fileName1": backup.fileName1,
                "fileName2": backup.fileName2,
                "serverName": backup.serverName,
                "ipAddress": backup.ipAddress,
                "frequency": backup.frequency,
                "typeOfBackup": backup.typeOfBackup,
                "reviewMonth": backup.reviewMonth,
                "days": " | ".join(days_status),
            }

            # Write data row to PDF
            data_values = list(row.values())
            for i, value in enumerate(data_values):
                p.drawString(x_positions[i], y_position, str(value))

            y_position -= 20
            if y_position < 50:
                p.showPage()
                y_position = 750

        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response

    def put(self, request, pk):
        try:
            instance = BackupDetail.objects.get(pk=pk)
        except BackupDetail.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = BackupDetailSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            # --- Acronics classification logic ---
            data = request.data
            review_month = data.get("reviewMonth")
            year = data.get("year")
            site = data.get("site")

            if review_month and year and site:
                try:
                    month_number = datetime.strptime(review_month, "%B").month
                    year = int(year)
                    acronics_entries = AcronicsBackup.objects.filter(
                        store=site,
                        date__year=year,
                        date__month=month_number
                    )

                    failed_dates = []
                    success_dates = []

                    for entry in acronics_entries:
                        tp = entry.tpcentraldb
                        cm = entry.tpcmdb
                        verified = entry.verified
                        entry_date = entry.date

                        if (tp != "Ok" or cm != "Ok") and verified:
                            failed_dates.append(entry_date)
                        elif tp == "Ok" and cm == "Ok" and verified:
                            success_dates.append(entry_date)

                    # Update the instance with Acronics data
                    instance.failed_dates = [date.strftime("%Y-%m-%d") for date in failed_dates]
                    instance.success_dates = [date.strftime("%Y-%m-%d") for date in success_dates]
                    instance.save()

                    return Response({
                        "updated_data": serializer.data,
                        "acronics_classified": {
                            "failed_dates": instance.failed_dates,
                            "success_dates": instance.success_dates,
                        }
                    }, status=status.HTTP_200_OK)

                except ValueError as ve:
                    print("Month conversion error:", ve)

            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """
        Delete an existing BackupDetail record.
        """
        try:
            instance = BackupDetail.objects.get(pk=pk)
            instance.delete()
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)  # ✅ Fixed
        except BackupDetail.DoesNotExist:
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
              
class POSUserStatusView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        store = request.data.get('store')
        month = request.data.get('month')
        files = request.FILES.getlist('files')
        year = request.data.get('year')
        # other_files = request.FILES.getlist('file')
        
        has_files = any(
            request.FILES.getlist(field)
            for field in ["SignoffFiles", "TotalUserFiles", "ActiveUserFiles", "InactiveUserFiles"]
        )
        file_urls = []

        valid_extensions = ['pdf', 'png', 'jpeg','jpg']
        pdf_writer = PdfWriter()
        
        if files:
            output_pdf_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}.pdf")
            os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)

            c.setFont("Helvetica-Bold", 20)
            c.setFillColorRGB(0, 0.4, 0.8) 
            c.drawString(50, 740, "User Access Privilege View")
            c.setFont("Helvetica", 14)
            c.setFillColorRGB(0, 0, 0)  
            c.drawString(50, 710, f"Conducted By: {request.data.get('store', '')}")

            c.setFont("Helvetica-Bold", 12)
            c.setFillColorRGB(0.8, 0.8, 0.8) 
            c.rect(48, 660, 500, 20, fill=1)  
            c.setFillColorRGB(0, 0, 0)  
            c.drawString(50, 665, "Details")

            form_data = [
                ("Date", request.data.get('date', '')),
                ("Store", store),
                ("Store Name", request.data.get('storename', '')),
                ("Name", request.data.get('name', '')),
                ("Designation", request.data.get('designation', '')),
                ("Employee ID", request.data.get('employeeid', '')),
                ("Review of Month", month),
                ("Total Users", request.data.get('posusers', '')),
                ("Active Users", request.data.get('activeusers', '')),
                ("Inactive Users", request.data.get('inactiveusers', '')),
                ("Year", request.data.get('year', '')),
                ("User List", request.data.get('userlist', '')),
            ]

            y_position = 650
            c.setFont("Helvetica", 10)
            row_colors = [(1, 1, 1), (0.9, 0.9, 0.9)]  
            for index, (label, value) in enumerate(form_data):
                fill_color = row_colors[index % 2]
                c.setFillColorRGB(*fill_color) 
                c.rect(48, y_position - 15, 500, 20, fill=1) 
                c.setFillColorRGB(0, 0, 0)  
                c.drawString(50, y_position -7, f"{label}:")
                c.drawString(200, y_position - 7, str(value))
                y_position -= 20

            y_position -= 40
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Validation Section:")
            y_position -= 40

            validation_labels = ["Name", "Designation", "Signature"]
            validation_data = [
                (request.data.get('validatedby1'), request.data.get('validatordesignation1'), "Signature 1"),
                (request.data.get('validatedby2'), request.data.get('validatordesignation2'), "Signature 2"),
                (request.data.get('validatedby3'), request.data.get('validatordesignation3'), "Signature 3"),
            ]

            for i, (name, designation, signature) in enumerate(validation_data):
                c.setFont("Helvetica", 10)
                x_position = 50 + (i * 180) 
                c.drawString(x_position, y_position, f"Name: {name}")
                c.drawString(x_position, y_position - 15, f"Designation: {designation}")
                c.drawString(x_position, y_position - 40, f"Signature: _____________")  

            y_position -= 90
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Approved By:")
            y_position -= 40

            approved_by_data = [
                ("Name:", "Designation:", "Employee ID:", "Signature: _____________"),
            ]

            for i, (name, designation, emp_id, signature) in enumerate(approved_by_data):
                x_position = 50 + (i * 150)
                c.setFont("Helvetica", 10)
                c.drawString(x_position, y_position, f"{name}")
                c.drawString(x_position, y_position - 15, f"{designation}")
                c.drawString(x_position, y_position - 30, f"{emp_id}")
                c.drawString(x_position, y_position - 55, f"{signature}")

            c.showPage()
            c.save()

            buffer.seek(0)
            with open(output_pdf_path, 'wb') as f:
                f.write(buffer.read())

            pdf_reader = PdfReader(output_pdf_path)
            pdf_writer.add_page(pdf_reader.pages[0])

            for file in files:
                file_extension = file.name.split('.')[-1].lower()
                if file_extension in ['png', 'jpeg']:
                    img = Image.open(file)
                    pdf_page_size = (1200, 800) 
                    img = ImageOps.contain(img, pdf_page_size)  
                    img_pdf = BytesIO()
                    img.convert('RGB').save(img_pdf, format='PDF')
                    img_pdf.seek(0)
                    pdf_reader = PdfReader(img_pdf)
                    pdf_writer.add_page(pdf_reader.pages[0])
                elif file_extension == 'pdf':
                    pdf_reader = PdfReader(file)
                    for page in pdf_reader.pages:
                        pdf_writer.add_page(page)

            combined_pdf_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}_combined.pdf")
            with open(combined_pdf_path, 'wb') as output_pdf_file:
                pdf_writer.write(output_pdf_file)

            file_url = os.path.join('media', 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}_combined.pdf")
            file_urls.append(file_url)

        if has_files:
            for field in ["SignoffFiles", "TotalUserFiles", "ActiveUserFiles", "InactiveUserFiles"]:
                file_list = request.FILES.getlist(field)
                for file in file_list:
                    file_extension = file.name.split('.')[-1].lower()
                    if file_extension not in valid_extensions:
                        return Response({"message": f"Invalid file extension: {file_extension}"}, status=status.HTTP_400_BAD_REQUEST)

                    base_file_name = f"{store}_POS_User_Status_{month}_{year}_Verified_{field}_{file.name}"
                    filename = base_file_name
                    save_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, filename)

                    # Check if file already exists for the given month and year
                    if os.path.exists(save_path):
                        return Response({"message": f"File '{filename}' already exists for the month {month}!"}, status=status.HTTP_400_BAD_REQUEST)

                    os.makedirs(os.path.dirname(save_path), exist_ok=True)

                    # Save file if it does not exist
                    with default_storage.open(save_path, 'wb+') as destination:
                        for chunk in file.chunks():
                            destination.write(chunk)

                    file_url = os.path.join("media", "POS_User_Status", month, filename)
                    file_urls.append(file_url)
                    
        # if other_files:
        #     file_urls = []
        #     file_number = 1

        #     for file in other_files:
        #         file_extension = file.name.split('.')[-1].lower()
        #         new_file_name = f"{store}_POS_User_Status_{month}_{year}_Verified_{file_number}_{file.name}.{file_extension}"
        #         save_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, new_file_name)
        #         os.makedirs(os.path.dirname(save_path), exist_ok=True)

        #         if os.path.exists(save_path):
        #             return Response({"message": "File already exists!"}, status=status.HTTP_400_BAD_REQUEST)

        #         # Save file
        #         with default_storage.open(save_path, 'wb+') as destination:
        #             for chunk in file.chunks():
        #                 destination.write(chunk)

        #         file_url = os.path.join("media", "POS_User_Status", month, new_file_name)
        #         file_urls.append(file_url)
        #         file_number += 1


        else:
            output_pdf_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}.pdf")
            os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)

            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=letter)

            c.setFont("Helvetica-Bold", 20)
            c.setFillColorRGB(0, 0.4, 0.8) 
            c.drawString(50, 740, "User Access Privilege View")
            c.setFont("Helvetica", 14)
            c.setFillColorRGB(0, 0, 0)  
            c.drawString(50, 710, f"Conducted By: {request.data.get('store', '')}")

            c.setFont("Helvetica-Bold", 12)
            c.setFillColorRGB(0.8, 0.8, 0.8) 
            c.rect(48, 660, 500, 20, fill=1)  
            c.setFillColorRGB(0, 0, 0)  
            c.drawString(50, 665, "Details")

            form_data = [
                ("Date", request.data.get('date', '')),
                ("Store", store),
                ("Store Name", request.data.get('storename', '')),
                ("Name", request.data.get('name', '')),
                ("Designation", request.data.get('designation', '')),
                ("Employee ID", request.data.get('employeeid', '')),
                ("Review of Month", month),
                ("Total Users", request.data.get('posusers', '')),
                ("Active Users", request.data.get('activeusers', '')),
                ("Inactive Users", request.data.get('inactiveusers', '')),
                ("Year", request.data.get('year', '')),
                ("User List", request.data.get('userlist', '')),
            ]

            y_position = 650
            c.setFont("Helvetica", 10)
            row_colors = [(1, 1, 1), (0.9, 0.9, 0.9)]  
            for index, (label, value) in enumerate(form_data):
                fill_color = row_colors[index % 2]
                c.setFillColorRGB(*fill_color) 
                c.rect(48, y_position - 15, 500, 20, fill=1) 
                c.setFillColorRGB(0, 0, 0)  
                c.drawString(50, y_position -7, f"{label}:")
                c.drawString(200, y_position - 7, str(value))
                y_position -= 20

            y_position -= 40
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Validation Section:")
            y_position -= 40

            validation_labels = ["Name", "Designation", "Signature"]
            validation_data = [
                (request.data.get('validatedby1'), request.data.get('validatordesignation1'), "Signature 1"),
                (request.data.get('validatedby2'), request.data.get('validatordesignation2'), "Signature 2"),
                (request.data.get('validatedby3'), request.data.get('validatordesignation3'), "Signature 3"),
            ]

            for i, (name, designation, signature) in enumerate(validation_data):
                c.setFont("Helvetica", 10)
                x_position = 50 + (i * 180) 
                c.drawString(x_position, y_position, f"Name: {name}")
                c.drawString(x_position, y_position - 15, f"Designation: {designation}")
                c.drawString(x_position, y_position - 40, f"Signature: _____________")  

            y_position -= 90
            c.setFont("Helvetica-Bold", 12)
            c.drawString(50, y_position, "Approved By:")
            y_position -= 40

            approved_by_data = [
                ("Name:", "Designation:", "Employee ID:", "Signature: _____________"),
            ]

            for i, (name, designation, emp_id, signature) in enumerate(approved_by_data):
                x_position = 50 + (i * 150)
                c.setFont("Helvetica", 10)
                c.drawString(x_position, y_position, f"{name}")
                c.drawString(x_position, y_position - 15, f"{designation}")
                c.drawString(x_position, y_position - 30, f"{emp_id}")
                c.drawString(x_position, y_position - 55, f"{signature}")

            c.showPage()
            c.save()

            buffer.seek(0)
            with open(output_pdf_path, 'wb') as f:
                f.write(buffer.read())

            pdf_reader = PdfReader(output_pdf_path)
            pdf_writer.add_page(pdf_reader.pages[0])

            combined_pdf_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}_combined.pdf")
            with open(combined_pdf_path, 'wb') as output_pdf_file:
                pdf_writer.write(output_pdf_file)

            file_url = os.path.join('media', 'POS_User_Status', month, f"{store}_POS_User_Status_{month}_{year}_combined.pdf")
            file_urls.append(file_url)

        return Response({
            "message": "Files uploaded and combined successfully!",
            "file_urls": file_urls
        }, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        store = request.query_params.get('store')
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        download_zip = request.query_params.get('download_zip', 'false').lower() == 'true'
        if not year:
            return Response({"error": "Year is required"}, status=status.HTTP_400_BAD_REQUEST)

        base_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status')
        result = []

        # Prepare file search based on given filters
        if store and store != "None" and month and month != "None":
            search_pattern = f"{store}_POS_User_Status_{month}_{year}_Verified_*.*"
            search_path = os.path.join(base_path, month, search_pattern)
            result.extend(glob.glob(search_path))
        elif store and store != "None" and not month:
            for month_folder in os.listdir(base_path):
                search_path = os.path.join(base_path, month_folder, f"{store}_POS_User_Status_*_{year}_Verified_*.*")
                result.extend(glob.glob(search_path))
        elif month and month != "None":
            search_path = os.path.join(base_path, month, f"*_{year}_Verified_*.*")
            result.extend(glob.glob(search_path))
        else:
            search_path = os.path.join(base_path, '*', f"*_{year}_Verified_*.*")
            result.extend(glob.glob(search_path))

        files = []
        file_paths = []

        for file in result:
            full_file_name = os.path.basename(file)
            relative_path = os.path.relpath(file, settings.MEDIA_ROOT)

            # Extract original file name from saved name
            # Example saved name: Store_POS_User_Status_Month_Year_Verified_1_MyFile.xlsx.xlsx
            parts = full_file_name.split('_Verified_')
            if len(parts) == 2 and '_' in parts[1]:
                original_file_name = parts[1].split('_', 1)[-1]
            else:
                original_file_name = full_file_name  # fallback

            files.append({
                "file_name": full_file_name,
                "original_file_name": original_file_name,
                "file_url": f"/media/{relative_path}"
            })
            file_paths.append(file)

        # Create and return ZIP if requested
        if download_zip and file_paths:
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for file in file_paths:
                    filename = os.path.basename(file)
                    parts = filename.split('_')
                    store = parts[0]  
                    month = parts[4]  
                    folder_path = f"{store}/{month}/"
                    zip_file.write(file, folder_path + filename)
            zip_buffer.seek(0)
            response = HttpResponse(zip_buffer.read(), content_type="application/zip")
            response['Content-Disposition'] = 'attachment; filename=POS_User_Status.zip'
            return response

        return Response(files, status=status.HTTP_200_OK)

#    def get1(self, request, *args, **kwargs):
#        store = request.query_params.get('store')
#       month = request.query_params.get('month')
        # year = request.query_params.get('year')
        
        # download_zip = request.query_params.get('download_zip', 'false').lower() == 'true'
        # if not year:
        #     return Response({"error": "Year is required"}, status=status.HTTP_400_BAD_REQUEST)

        # base_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status')
        # result = []
        # if store and store != "None" and month and month != "None":
        #     # If both store and month are specified, look for the specific report
        #     file_name = f"{store}_POS_User_Status_{month}_{year}_Verified.*"
        #     search_path = os.path.join(base_path, month, file_name)
        #     result.extend(glob.glob(search_path))
        # elif store and store != "None" and not month:
        #     for month_folder in os.listdir(base_path):
        #         search_path = os.path.join(base_path, month_folder, f"{store}_POS_User_Status_*_{year}_Verified.*")
        #         result.extend(glob.glob(search_path))
        # elif month and month != "None":
        #     search_path = os.path.join(base_path, month, f"*_{year}_Verified.*")
        #     result.extend(glob.glob(search_path))
        # else:
        #     search_path = os.path.join(base_path, '*', f"*_{year}_Verified.*")
        #     result.extend(glob.glob(search_path))

        # files = []
        # file_paths = []
        # for file in result:
        #     files.append({
        #         "file_name": os.path.basename(file),
        #         "file_url": f"/media/{os.path.relpath(file, settings.MEDIA_ROOT)}",
        #     })
        #     file_paths.append(file)


        # if download_zip and file_paths:
        #     zip_buffer = BytesIO()
        #     with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        #         for file in file_paths:
        #             zip_file.write(file, os.path.basename(file))
        #     zip_buffer.seek(0)
        #     response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        #     response['Content-Disposition'] = 'attachment; filename=POS_User_Status.zip'
        #     return response

        # return Response(files, status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        data = JSONParser().parse(request)
        file_url = data.get('file_url')
        
        if not file_url:
            return Response({"error": "file_url is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_url = file_url.replace("\\", "/")  
        file_parts = file_url.split("/")
        file_name = file_parts[-1] 
        
        if len(file_parts) >= 3: 
            try:
                year = file_name.split("_")[-2]
                month = file_parts[-2] 
            except IndexError:
                return Response({"error": "Invalid file naming convention"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Invalid file structure"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_path = os.path.join(settings.MEDIA_ROOT, 'POS_User_Status', month, file_name)  # Construct correct file path
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return Response({"message": "File deleted successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

class IdtRegisterView(APIView): 
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='IdtRegister').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        store = request.query_params.get('store')
        action = request.query_params.get('action', None)  
        username = request.query_params.get('user', None) 
        
        if action == 'history':  
            return self.get_history(request)
        if action == "CSV":
            log_action('IdtRegister', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
        if action == "PDF":
            log_action('IdtRegister', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date if start_date else None,
                    'enddate': end_date if end_date else None, 'store': store})
    
        verified = request.query_params.get('verified', None)  
        queryset = IdtRegister.objects.all()

        format_type = request.query_params.get('format', 'json')

        if start_date:
            start_date = parse_date(start_date)
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            end_date = parse_date(end_date)
            queryset = queryset.filter(date__lte=end_date)
        if store and store != "None":
            queryset = queryset.filter(store=store)
        if verified is not None:
            queryset = queryset.filter(verified=(verified.lower() == 'true'))


        sql_query = str(queryset.query)
        log_action('IdtRegister', 'FETCH', username or request.user.username, {'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None,'store': store, "query": sql_query})  
        
        if format_type == 'csv':
            log_action('IdtRegister', 'DOWNLOAD', username or request.user.username, {'format': 'csv', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_csv(queryset)
        elif format_type == 'pdf':
            log_action('IdtRegister', 'DOWNLOAD', username or request.user.username, {'format': 'pdf', 'startdate': start_date.isoformat() if start_date else None,
                    'enddate': end_date.isoformat() if end_date else None, 'store': store})
            return self.generate_pdf(queryset)

        serializer = IdtRegisterSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = IdtRegisterSerializer(data=request.data, many=isinstance(request.data, list))
        if serializer.is_valid():
            store = request.data.get('store')
            date = request.data.get('date')
            user = request.data.get('user')  
            serializer.save()  
            log_action('IdtRegister', 'CREATE', user, {
                'status': 'Entry created', 'store': store, 'date': date, 'details': request.data
            })
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)

        # Check for authorized stores based on user roles
        authorized_stores = Store.objects.filter(
            itincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            assitincharge=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            itmanager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            admin_manager=user
        ).values_list('storecode', flat=True) | Store.objects.filter(
            cio=user
        ).values_list('storecode', flat=True)

        if pk:
            try:
                instance = IdtRegister.objects.get(pk=pk)
            except IdtRegister.DoesNotExist:
                return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

            if request.data.get('verified', False) and instance.store not in authorized_stores:
                return Response({"detail": "User is not authorized to verify this store."}, status=status.HTTP_403_FORBIDDEN)

            if instance.store not in authorized_stores and not request.data.get('verified', False):
                serializer = IdtRegisterSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    log_action('IdtRegister', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store not in authorized_stores and request.data.get('verified', False):
                serializer = IdtRegisterSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    log_action('IdtRegister', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if instance.store in authorized_stores and not request.data.get('verified', False):
                serializer = IdtRegisterSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    log_action('IdtRegister', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if request.data.get('verified', False) and instance.store in authorized_stores:
                serializer = IdtRegisterSerializer(instance, data=request.data, partial=True)
                if serializer.is_valid():
                    if request.data.get('verified', False):  
                        serializer.save(verified=True, verifiedby=user)
                    else:
                        serializer.save()
                    log_action('IdtRegister', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
                    return Response(serializer.data, status=status.HTTP_200_OK)

            return Response({"detail": "You do not have permission to verify this record."}, status=status.HTTP_403_FORBIDDEN)

        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No records selected."}, status=status.HTTP_400_BAD_REQUEST)

        updated = IdtRegister.objects.filter(id__in=ids, store__in=authorized_stores).update(verified=True, verifiedby=user)

        if updated > 0:
            log_action('IdtRegister', 'VERIFIED', user, {'status': 'Verified', 'ids': ids})
            return Response({"detail": f"{updated} records verified successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No records found to update or user not authorized for selected stores."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            checklist = IdtRegister.objects.get(pk=pk)
            user = request.data.get('user', request.user.username) 
            checklist.delete()
            log_action('IdtRegister', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({'message': 'Record deleted successfully!'}, status=status.HTTP_200_OK)
        except IdtRegister.DoesNotExist:
            log_action('IdtRegister', 'DELETE', user, {'error': 'Record not found'})
            return Response({'error': 'Record not found'}, status=status.HTTP_404_NOT_FOUND)
      
    def generate_csv(self, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="IDT_Register_List.csv"'
        writer = csv.writer(response, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['Date', 'Store', 'Store Name', 'Vendor Name', 'Vendor Phone Number', 'Purpose', 'Access Type', 'In Time', 'Out Time', 'Assisted By','Remarks'])
        for user in queryset:
            writer.writerow([
                user.date,
                user.store,
                user.storename,
                user.vendorName,
                user.vendorPhone,
                user.purpose,
                user.accessType,
                user.inTime if user.inTime else "",
                user.outTime if user.outTime else "",
                user.assistedby if user.assistedby else "",
                user.remarks if user.remarks else "",
            ])

        return response

    def generate_pdf(self, queryset):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="IDT_Register_List.pdf"'
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Date")
        p.drawString(200, 750, "Store")
        p.drawString(300, 750, "Store Name")
        p.drawString(400, 750, "Vendor Name")
        p.drawString(500, 750, "Vendor Phone Number")
        p.drawString(600, 750, "Purpose")
        p.drawString(700, 750, "Access Type")
        p.drawString(800, 750, "In Time")
        p.drawString(900, 750, "Out Time")
        p.drawString(1000, 750, "Assisted By")
        p.drawString(1100, 750, "Remarks")

        y_position = 730
        for user in queryset:
            y_position -= 20
            p.drawString(100, y_position, str(user.date))
            p.drawString(200, y_position, str(user.store))
            p.drawString(300, y_position, str(user.storename))
            p.drawString(400, y_position, str(user.vendorName))
            p.drawString(500, y_position, str(user.vendorPhone))
            p.drawString(600, y_position, str(user.purpose))
            p.drawString(700, y_position, str(user.accessType))
            p.drawString(800, y_position, str(user.inTime))
            p.drawString(900, y_position, str(user.outTime))
            p.drawString(1000, y_position, str(user.assistedby))
            p.drawString(1100, y_position, str(user.remarks))

            if y_position < 50: 
                p.showPage()
                y_position = 750

        p.showPage()
        p.save()
        buffer.seek(0)
        response.write(buffer.read())
        return response
    
class ProfileView(APIView): 
    def get_history(self, request):
        logs = ActionLog.objects.filter(view_name='Profile').order_by('-timestamp')
        history = []
        for log in logs:
            details = log.details
            if isinstance(details, dict) and "query" in details and isinstance(details["query"], str):
                query = details["query"]
                from_index = query.upper().find("FROM")
                if from_index != -1:
                    details["query"] = query[from_index:]  # keep only FROM onwards

            history.append({
                'action': log.action,
                'user': log.user,
                'timestamp': log.timestamp,
                'details': details,
                'related_object': log.related_object
            })
        
        return Response(history)
    
    def get(self, request):
        storecode = request.query_params.get('store')
        
        if storecode and storecode!= 'None':
            filters = {}
            if storecode:
                filters['storecode'] = storecode
            entries = Profile.objects.filter(**filters)
        else:
            entries = Profile.objects.all()

        serializer = ProfileSerializer(entries, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.data.get('user', request.user.username)
        storecode = request.data.get('storecode')
        employeeid = request.data.get('employeeid')
        
        if not storecode:
            return Response({"detail": "Store code."}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_entry = Profile.objects.filter(employeeid=employeeid).first()
        if existing_entry:
            serializer = ProfileSerializer(existing_entry, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                log_action('Profile', 'UPDATE', user, {'status': 'Updated', 'detail': request.data})
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            log_action('Profile', 'CREATE', user, {
                'status': 'Entry created', 'store': storecode, 'details': request.data
            })
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        user = request.data.get('user', request.user.username)
        if not pk:
            return Response({"detail": "ID is required for update."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            instance = Profile.objects.get(pk=pk)
        except Profile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProfileSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action('Profile', 'UPDATE', user, {'status': 'Updated', 'id': pk, 'detail': request.data})
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            user = request.data.get('user', request.user.username) 
            instance = Profile.objects.get(pk=pk)
            instance.delete()
            log_action('Profile', 'DELETE', user, {'status': 'Deleted', 'pk': pk})
            return Response({"message": "Record deleted successfully!"}, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            user = request.data.get('user', request.user.username)
            log_action('Profile', 'DELETE', user, {'error': 'Record not found'})
            return Response({"error": "Record not found."}, status=status.HTTP_404_NOT_FOUND)
   
class ProfileListView(APIView):   
    def get(self, request, employee_id):
        """Fetches profile details based on employee ID."""
        try:
            profile = Profile.objects.get(employeeid=employee_id)  # Use `.get()` instead of `.filter()`
            data = {
                "storecode": profile.storecode,
                "designation": profile.designation,
                "storeunder": profile.storeunder 
            }
            return JsonResponse(data, status=200)
        except Profile.DoesNotExist:
            return JsonResponse({"error": "Profile not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

class StoreDetailView(APIView):  
    def get(self, request, storecode):
        store = Store.objects.filter(storecode=storecode).first()
        
        if not store:
            return Response({"error": f"Store {storecode} not found"}, status=404)  # Explicit 404 for missing stores

        serializer = StoreSerializer(store)
        return Response(serializer.data)

class BackupDetailVerifiedView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        """Upload a file and save it in the database"""
        print("Received Data:", request.data)  
        serializer = BackupDetailVerifiedSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            print("Saved Data:", serializer) 
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Retrieve backups based on review month and year"""
        store = request.GET.get('store')
        review_month = request.GET.get('reviewMonth1', None)
        year = request.GET.get('year')

        print(f"Review Month: {review_month}, Year: {year}, Store: {store}")

        # Check if year is present (required)
        if not year:
            return JsonResponse({'error': 'Year is required'}, status=400)

        filters = {'year': year}

        # Add reviewMonth1 filter if it's not "None" or null
        if review_month and review_month.lower() != "none":
            filters['reviewMonth1'] = review_month

        # Add store filter
        if store and store.lower() != "none":
            if "," in store:
                store_list = store.split(",")
                filters['store__in'] = store_list
            else:
                filters['store'] = store

        # Apply filters
        backups = BackupDetailVerified.objects.filter(**filters)

        if backups.exists():
            serializer = BackupDetailVerifiedSerializer(backups, many=True)
            return JsonResponse(serializer.data, safe=False)
        else:
            return JsonResponse([], safe=False)  

    def put(self, request, pk, *args, **kwargs):
        """Update an existing file"""
        file_instance = get_object_or_404(BackupDetailVerified, pk=pk)
        
        serializer = BackupDetailVerifiedSerializer(file_instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, *args, **kwargs):
        backup = get_object_or_404(BackupDetailVerified, pk=pk)

        if not backup.file:
            print("No file associated with this backup.")
        else:
            file_path = backup.file.path  # ✅ This returns the actual string path
            print(f"Attempting to delete file at {file_path}")

            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print("File deleted successfully.")
                except Exception as e:
                    print(f"Error deleting file: {e}")
                    return Response({"error": f"Failed to delete file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                print("File does not exist on disk.")

        backup.delete()
        return Response({"message": "Backup entry and file deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
