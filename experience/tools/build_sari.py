"""Build the original Sari variant using the shared civilian rig generator."""
import os,runpy
from pathlib import Path
os.environ['JEJAKA_CHARACTER_VARIANT']='SARI'
runpy.run_path(str(Path(__file__).with_name('build_characters.py')),run_name='__main__')
