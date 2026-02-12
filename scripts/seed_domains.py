"""
Standalone seed script for default domains and fields.
Can be run directly: python scripts/seed_domains.py
Or it runs automatically on backend startup via main.py lifespan.
"""

import asyncio
import sys
import os

# Add the backend directory to the path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import async_session
from app.models.domain import Domain
from app.models.field import Field
from sqlalchemy import select


SEED_DATA = {
    "Cell": {
        "sort_order": 1,
        "fields": [
            {"name": "chemistry", "display_name": "Chemistry", "unit": None, "data_type": "text", "sort_order": 1},
            {"name": "cell_format", "display_name": "Cell Format", "unit": None, "data_type": "select", "sort_order": 2,
             "select_options": ["Prismatic", "Pouch", "Cylindrical 1865", "Cylindrical 2170", "Cylindrical 4680", "Cylindrical 46120"]},
            {"name": "cell_supplier", "display_name": "Cell Supplier", "unit": None, "data_type": "text", "sort_order": 3},
            {"name": "cell_capacity_ah", "display_name": "Cell Capacity", "unit": "Ah", "data_type": "number", "sort_order": 4},
            {"name": "cell_nominal_voltage", "display_name": "Cell Nominal Voltage", "unit": "V", "data_type": "number", "sort_order": 5},
            {"name": "cell_weight_kg", "display_name": "Cell Weight", "unit": "kg", "data_type": "number", "sort_order": 6},
            {"name": "cell_dimensions_mm", "display_name": "Cell Dimensions (LxWxH)", "unit": "mm", "data_type": "text", "sort_order": 7},
        ],
    },
    "Cellblock rest": {
        "sort_order": 2,
        "fields": [
            {"name": "module_count", "display_name": "Module Count", "unit": None, "data_type": "number", "sort_order": 1},
            {"name": "cells_per_module", "display_name": "Cells per Module", "unit": None, "data_type": "number", "sort_order": 2},
            {"name": "cells_total", "display_name": "Total Cell Count", "unit": None, "data_type": "number", "sort_order": 3},
            {"name": "configuration_sxp", "display_name": "Configuration (sXp)", "unit": None, "data_type": "text", "sort_order": 4},
            {"name": "module_weight_kg", "display_name": "Module Weight", "unit": "kg", "data_type": "number", "sort_order": 5},
        ],
    },
    "E/E": {
        "sort_order": 3,
        "fields": [
            {"name": "voltage_architecture_v", "display_name": "Voltage Architecture", "unit": "V", "data_type": "select", "sort_order": 1,
             "select_options": ["400", "800"]},
            {"name": "obc_power_kw", "display_name": "OBC Power", "unit": "kW", "data_type": "number", "sort_order": 2},
            {"name": "bms_supplier", "display_name": "BMS Supplier", "unit": None, "data_type": "text", "sort_order": 3},
            {"name": "contactor_type", "display_name": "Contactor Type", "unit": None, "data_type": "text", "sort_order": 4},
            {"name": "precharge_circuit", "display_name": "Precharge Circuit", "unit": None, "data_type": "text", "sort_order": 5},
            {"name": "dcdc_converter", "display_name": "DC-DC Converter", "unit": None, "data_type": "text", "sort_order": 6},
        ],
    },
    "Housing": {
        "sort_order": 4,
        "fields": [
            {"name": "pack_weight_kg", "display_name": "Pack Weight", "unit": "kg", "data_type": "number", "sort_order": 1},
            {"name": "pack_dimensions_lxwxh_mm", "display_name": "Pack Dimensions (LxWxH)", "unit": "mm", "data_type": "text", "sort_order": 2},
            {"name": "housing_material", "display_name": "Housing Material", "unit": None, "data_type": "text", "sort_order": 3},
            {"name": "ip_rating", "display_name": "IP Rating", "unit": None, "data_type": "text", "sort_order": 4},
            {"name": "structural_role", "display_name": "Structural Role", "unit": None, "data_type": "select", "sort_order": 5,
             "select_options": ["Cell-to-Pack", "Cell-to-Body", "Module-to-Pack", "Structural Battery"]},
        ],
    },
    "Thermal Management": {
        "sort_order": 5,
        "fields": [
            {"name": "cooling_type", "display_name": "Cooling Type", "unit": None, "data_type": "select", "sort_order": 1,
             "select_options": ["Bottom plate", "Side cooling", "Immersion", "Tab cooling", "Top and bottom plate"]},
            {"name": "coolant_type", "display_name": "Coolant Type", "unit": None, "data_type": "text", "sort_order": 2},
            {"name": "cooling_plate_material", "display_name": "Cooling Plate Material", "unit": None, "data_type": "text", "sort_order": 3},
            {"name": "thermal_interface_material", "display_name": "Thermal Interface Material", "unit": None, "data_type": "text", "sort_order": 4},
            {"name": "heat_pump_integration", "display_name": "Heat Pump Integration", "unit": None, "data_type": "select", "sort_order": 5,
             "select_options": ["Yes", "No", "Unknown"]},
        ],
    },
    "Busbar": {
        "sort_order": 6,
        "fields": [
            {"name": "busbar_material", "display_name": "Busbar Material", "unit": None, "data_type": "text", "sort_order": 1},
            {"name": "busbar_cross_section_mm2", "display_name": "Busbar Cross Section", "unit": "mm\u00b2", "data_type": "number", "sort_order": 2},
            {"name": "cell_connection_type", "display_name": "Cell Connection Type", "unit": None, "data_type": "select", "sort_order": 3,
             "select_options": ["Wire bonding", "Laser welding", "Ultrasonic welding", "Bolted", "Flexible busbar"]},
            {"name": "fuse_type", "display_name": "Fuse Type", "unit": None, "data_type": "text", "sort_order": 4},
        ],
    },
    "Other components": {
        "sort_order": 7,
        "fields": [
            {"name": "gross_capacity_kwh", "display_name": "Gross Capacity", "unit": "kWh", "data_type": "number", "sort_order": 1},
            {"name": "net_capacity_kwh", "display_name": "Net Capacity", "unit": "kWh", "data_type": "number", "sort_order": 2},
            {"name": "max_charge_power_kw", "display_name": "Max Charge Power", "unit": "kW", "data_type": "number", "sort_order": 3},
            {"name": "max_discharge_power_kw", "display_name": "Max Discharge Power", "unit": "kW", "data_type": "number", "sort_order": 4},
            {"name": "pack_gravimetric_density_whkg", "display_name": "Pack Gravimetric Energy Density", "unit": "Wh/kg", "data_type": "number", "sort_order": 5},
            {"name": "pack_volumetric_density_whl", "display_name": "Pack Volumetric Energy Density", "unit": "Wh/L", "data_type": "number", "sort_order": 6},
        ],
    },
}


async def seed():
    async with async_session() as session:
        for domain_name, domain_data in SEED_DATA.items():
            result = await session.execute(select(Domain).where(Domain.name == domain_name))
            domain = result.scalar_one_or_none()

            if domain is None:
                domain = Domain(
                    name=domain_name,
                    sort_order=domain_data["sort_order"],
                    is_default=True,
                )
                session.add(domain)
                await session.flush()
                print(f"  Created domain: {domain_name}")
            else:
                print(f"  Domain already exists: {domain_name}")

            for field_data in domain_data["fields"]:
                result = await session.execute(
                    select(Field).where(Field.domain_id == domain.id, Field.name == field_data["name"])
                )
                if result.scalar_one_or_none() is None:
                    field = Field(
                        domain_id=domain.id,
                        name=field_data["name"],
                        display_name=field_data["display_name"],
                        unit=field_data.get("unit"),
                        data_type=field_data["data_type"],
                        select_options=field_data.get("select_options"),
                        sort_order=field_data["sort_order"],
                    )
                    session.add(field)
                    print(f"    Created field: {field_data['name']}")

        await session.commit()
    print("Seeding complete.")


if __name__ == "__main__":
    print("Seeding default domains and fields...")
    asyncio.run(seed())
