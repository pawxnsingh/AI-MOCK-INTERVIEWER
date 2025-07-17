from datetime import datetime, timezone
import logging

logger = logging .getLogger(__name__)


class StandardDT:
    
    @staticmethod
    def get_iso_dt() -> datetime:
        """returns the current datetime in utc timezone"""
        return datetime.now(timezone.utc)
    
    @staticmethod
    def get_iso_dt_string():
        """returns the current datetime in utc timezone and iso format string. (e.g: '2025-05-13T11:47:46.818221+00:00')"""
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def get_dt_from_iso(iso_dt: str):
        """returns the datetime type object constructed from the iso format string input, if exception then returns None"""
        try:
            return datetime.fromisoformat(iso_dt)
        except Exception:
            logger.exception("[StandardDT.get_dt_from_iso] :: caught exception while parsing iso date to datetime")
            return
        
    @staticmethod    
    def get_timestamp_from_iso_str(iso_dt_str: str):
        """rerturns the rounded timestamp of the iso date string input, if exception then returns None"""
        try:
            return round(datetime.fromisoformat(iso_dt_str).timestamp()*1000)
        except Exception:
            logger.exception("[StandardDT.get_timestamp_from_iso] :: caught exception while getting timestamp from iso format")
            return
        
    @staticmethod
    def get_timestamp_from_iso_dt(iso_dt: datetime):
        """returns the timestamp of the iso date input, if exception then returns None"""
        try:
            iso_dt_str = iso_dt.isoformat()
            return round(datetime.fromisoformat(iso_dt_str).timestamp()*1000)
        except Exception: 
            logger.exception("[StandardDT.get_timestamp_from_iso_dt] :: caught exception while getting timestamp from iso datetime")
            return
        
    @staticmethod    
    def get_current_timestamp() -> int:
        """returns the current rounded timestamp in utc timezone"""
        return round(datetime.now(timezone.utc).timestamp()*1000)
    
    @staticmethod
    def get_current_utc_dt():
        """returns the current datetime in utc timzone"""
        return datetime.now(timezone.utc)
    
