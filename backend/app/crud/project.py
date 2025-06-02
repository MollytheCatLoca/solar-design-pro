# backend/app/crud/project.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Project
from app.schemas import ProjectCreate, ProjectUpdate


class CRUDProject:
    def get(self, db: Session, id: int) -> Optional[Project]:
        return db.query(Project).filter(Project.id == id).first()
    
    def get_multi(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Project]:
        return db.query(Project).offset(skip).limit(limit).all()
    
    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        return (
            db.query(Project)
            .filter(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_owner(
        self, db: Session, *, obj_in: ProjectCreate, owner_id: int
    ) -> Project:
        db_obj = Project(**obj_in.model_dump(), owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, db: Session, *, db_obj: Project, obj_in: ProjectUpdate
    ) -> Project:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Project:
        obj = db.query(Project).get(id)
        db.delete(obj)
        db.commit()
        return obj


project = CRUDProject()