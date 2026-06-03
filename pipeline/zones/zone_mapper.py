from shapely.geometry import Point
from shapely.geometry import Polygon


class ZoneMapper:

    def __init__(self, zones):

        self.zones = {}

        for zone_name, coords in zones.items():

            self.zones[zone_name] = Polygon(
                coords
            )

    def get_zone(
        self,
        x,
        y
    ):

        point = Point(
            x,
            y
        )

        for zone_name, polygon in self.zones.items():

            if polygon.contains(point):

                return zone_name

        return None