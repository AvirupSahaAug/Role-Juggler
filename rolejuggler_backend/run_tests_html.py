import unittest
import HtmlTestRunner
import os
from django.conf import settings
import django

# Initialize Django environment
os.environ['DJANGO_SETTINGS_MODULE'] = 'rolejuggler_backend.settings'
django.setup()

if __name__ == "__main__":
    test_loader = unittest.defaultTestLoader
    test_suite = test_loader.discover('api')  # You can add other apps here too

    # Generate timestamped report filename
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    runner = HtmlTestRunner.HTMLTestRunner(
        combine_reports=True,
        report_title='RoleJuggler Automated Test Report',
        descriptions='Detailed Django API test execution summary',
        output=f'reports/test_report_{timestamp}'  # Creates a folder per run
    )

    runner.run(test_suite)
