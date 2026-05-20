from app.core.database import get_session

# get_session is defined in database.py and re-exported here so all routers
# import their dependency from a single, consistent location:
#
#   from app.api.deps import get_session
#   ...
#   def endpoint(session: Session = Depends(get_session)):
#
# If you add more shared dependencies (e.g. get_current_user), add them here.