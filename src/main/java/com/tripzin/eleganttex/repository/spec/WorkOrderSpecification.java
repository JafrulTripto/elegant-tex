package com.tripzin.eleganttex.repository.spec;

import com.tripzin.eleganttex.entity.WorkOrder;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class WorkOrderSpecification {
    
    public static Specification<WorkOrder> filterBy(Map<String, String> filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            filters.forEach((key, value) -> {
                if (value != null && !value.isEmpty()) {
                    switch (key) {
                        case "woNumber":
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("woNumber")),
                                    "%" + value.toLowerCase() + "%"));
                            break;
                        case "workType":
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("workType")),
                                    "%" + value.toLowerCase() + "%"));
                            break;
                        case "client":
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("client")),
                                    "%" + value.toLowerCase() + "%"));
                            break;
                        case "state":
                            predicates.add(criteriaBuilder.equal(root.get("state"), value));
                            break;
                        case "orderStatus":
                            predicates.add(criteriaBuilder.equal(root.get("orderStatus"), value));
                            break;
                        case "updater":
                            predicates.add(criteriaBuilder.like(
                                    criteriaBuilder.lower(root.get("updater")),
                                    "%" + value.toLowerCase() + "%"));
                            break;
                        case "isRush":
                            predicates.add(criteriaBuilder.equal(root.get("isRush"), Boolean.parseBoolean(value)));
                            break;
                        case "startDate":
                            predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                                    root.get("clientDueDate"), LocalDate.parse(value)));
                            break;
                        case "endDate":
                            predicates.add(criteriaBuilder.lessThanOrEqualTo(
                                    root.get("clientDueDate"), LocalDate.parse(value)));
                            break;
                        case "userId":
                            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), Long.parseLong(value)));
                            break;
                    }
                }
            });
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
