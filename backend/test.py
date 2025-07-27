import subprocess
import json
import sys
import os
from datetime import datetime, timedelta
import random
import string
import time

js_file = "ts_files_db/index.js"

#to get all the inventories
result = subprocess.run(["node", js_file, "inventory_ops.getAll"], capture_output=True, text=True)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("Return code:", result.returncode)