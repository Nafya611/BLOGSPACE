"""
django command to wait for database to be avaliable

"""
import time
from psycopg2 import OperationalError as psycopg2OpError

from django.db.utils import OperationalError

from django.core.management.base import BaseCommand

class Command(BaseCommand):


    def handle(self,*args,**options):
        """Entry point for the command"""
        self.stdout.write('waiting for database..')
        db_up= False
        while db_up is False:
            try:
                self.check(databases=['default'])
                db_up=True
            except (psycopg2OpError,OperationalError):
                self.stdout.write('Database unavailable, waiting 1 second..')
                time.sleep(1)
        self.stdout.write(self.style.SUCCESS('Database available!'))

